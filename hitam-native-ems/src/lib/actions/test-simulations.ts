"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * UAT L-01: 14-Day Archival Simulation
 * Forces an event to be marked as COMPLETED and backdates it to 15 days ago,
 * then triggers a simulated archival run.
 */
export async function simulateArchivalAction(eventId: string) {
  try {
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    
    // 1. Force the event into a state where it's eligible for archival
    await db.update(schema.events)
      .set({ 
        status: "COMPLETED", 
        updatedAt: fifteenDaysAgo 
      })
      .where(eq(schema.events.id, eventId));

    // 2. Log institutional audit override
    await db.insert(schema.auditLogs).values({
      action: "UAT_ARCHIVAL_SIMULATION",
      entityId: eventId,
      userId: "TEST_HARNESS",
      details: { forcedDate: fifteenDaysAgo.toISOString() }
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Archival simulation failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * UAT P-03: Security Breach Simulation
 * Directly triggers the verifyPaymentAction with a guaranteed invalid signature.
 */
export async function simulatePaymentBreachAction(registrationId: string) {
  const { verifyPaymentAction } = await import("./registration");
  
  // Attempt with "mismatched_signature"
  return await verifyPaymentAction(
    registrationId, 
    "pay_breach_123", 
    "order_breach_456", 
    "invalid_institutional_signature_789"
  );
}
