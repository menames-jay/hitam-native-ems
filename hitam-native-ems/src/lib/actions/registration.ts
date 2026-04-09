"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

/**
 * Student Registration Flow
 */
export async function registerForEventAction(eventId: string, studentId: string) {
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

      revalidatePath(`/events/${eventId}`);
      return { success: true, requiresPayment: false };
    }
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Verify Razorpay Payment (Simplified for now)
 */
export async function verifyPaymentAction(registrationId: string, paymentId: string, orderId: string) {
  try {
    // In a real app, verify signature here
    await db.update(schema.paymentRecords)
      .set({ 
        status: "SUCCESS",
        razorpayPaymentId: paymentId
      })
      .where(eq(schema.paymentRecords.registrationId, registrationId));

    revalidatePath("/registrations");
    return { success: true };
  } catch (error) {
    console.error("Payment verification failed:", error);
    return { success: false, error: (error as Error).message };
  }
}
