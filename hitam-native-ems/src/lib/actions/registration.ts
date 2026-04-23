"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

/**
 * Student Registration Flow
 */
export async function registerForEventAction(eventId: string, _ignoredStudentId?: string) {
  const { getServerSession } = await import("@/lib/auth/role");
  const session = await getServerSession();

  if (!session) throw new Error("Unauthorized: Please log in to register for events.");
  const studentId = session.user.id;

  try {
    // 1. Check if already registered
    const existing = await db.query.registrations.findFirst({
      where: (regs, { and, eq }) => and(
        eq(regs.eventId, eventId),
        eq(regs.studentId, studentId)
      )
    });

    if (existing) {
      throw new Error("You are already registered for this event.");
    }

    const event = await db.query.events.findFirst({
      where: eq(schema.events.id, eventId)
    });

    if (!event) throw new Error("Event not found.");

    if (event.isPaid && event.price) {
      // 2. Initiate Payment Workflow
      const order = await razorpay.orders.create({
        amount: event.price * 100, // in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      // Create a pending registration and payment record
      const [newReg] = await db.insert(schema.registrations)
        .values({
          eventId,
          studentId,
        })
        .returning();

      await db.insert(schema.paymentRecords)
        .values({
          registrationId: newReg.id,
          amount: event.price,
          status: "PENDING",
          razorpayOrderId: order.id,
        });

      return { 
        success: true, 
        requiresPayment: true, 
        orderId: order.id, 
        amount: event.price,
        registrationId: newReg.id 
      };
    } else {
      // 3. Direct Free Registration
      await db.insert(schema.registrations)
        .values({
          eventId,
          studentId,
        });

      // NOTIFICATION LEDGER
      await db.insert(schema.notifications).values({
        userId: studentId,
        title: "Registration Confirmed",
        message: `You've successfully registered for the event. Check your upcoming sessions for details.`
      });

      // EMAIL NOTIFICATION
      const student = await db.query.user.findFirst({ where: eq(schema.user.id, studentId) });
      if (student?.email) {
        const { sendRegistrationEmail } = await import("@/lib/services/email-service");
        sendRegistrationEmail(student.email, event.title, new Date().toLocaleDateString()).catch(console.error);
      }

      return { success: true, requiresPayment: false };
    }
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Verify Razorpay Payment (Production Hardened)
 */
export async function verifyPaymentAction(
  registrationId: string, 
  paymentId: string, 
  orderId: string,
  signature: string
) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
    
    // 1. Cryptographic Signature Verification
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== signature) {
      // LOG THE BREACH ATTEMPT
      await db.insert(schema.auditLogs).values({
        action: "PAYMENT_SIGNATURE_MISMATCH",
        entityId: registrationId,
        userId: "SYSTEM",
        details: { orderId, paymentId, signature }
      });
      throw new Error("Invalid institutional payment signature. Governance breach detected.");
    }

    // 2. Fetch Registration & Student Context
    const registration = await db.query.registrations.findFirst({
      where: eq(schema.registrations.id, registrationId),
      with: {
        event: true,
        student: true
      }
    });

    if (!registration) throw new Error("Registration record missing.");

    // 3. Update Payment Status to COMPLETED
    await db.update(schema.paymentRecords)
      .set({ 
        status: "COMPLETED", 
        razorpayPaymentId: paymentId,
        razorpaySignature: signature 
      })
      .where(eq(schema.paymentRecords.registrationId, registrationId));

    // 4. Institutional Audit Log
    await db.insert(schema.auditLogs).values({
      action: "PAYMENT_COMPLETED",
      entityId: registrationId,
      userId: registration.studentId,
      details: { amount: registration.event.price, event: registration.event.title }
    });

    // 5. Institutional Email Notification (Async)
    if (registration.student?.email) {
      const { sendRegistrationEmail } = await import("@/lib/services/email-service");
      sendRegistrationEmail(registration.student.email, registration.event.title, new Date().toLocaleDateString()).catch(console.error);
    }

    revalidatePath("/registrations");
    return { success: true };
  } catch (error) {
    console.error("Payment verification failed:", error);
    return { success: false, error: (error as Error).message };
  }
}
