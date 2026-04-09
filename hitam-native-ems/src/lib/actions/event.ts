"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Institutional Governance: Create an Event & Trigger Workflow
 */
export async function createEventAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string; // 'club' or 'technical'
    const venueId = formData.get("venueId") as string;
    const startTime = new Date(formData.get("startTime") as string);
    const endTime = new Date(formData.get("endTime") as string);
    const isPaid = formData.get("isPaid") === "on";
    const price = isPaid ? parseInt(formData.get("price") as string) : 0;
    const userId = formData.get("userId") as string;
    const userRole = formData.get("userRole") as string;
    
    if (isPaid && isNaN(price)) {
      throw new Error("A valid price is required for paid events");
    }
    
    // 1. Create the Event record
    const [newEvent] = await db.insert(schema.events)
      .values({
        title,
        description,
        status: "PENDING_APPROVAL",
        createdBy: userId,
        isPaid,
        price,
        coverImage: "https://via.placeholder.com/1200x600?text=Institutional+Event+Poster" 
      })
      .returning();

    // 2. Create the Session & Venue Allocation
    const [newSession] = await db.insert(schema.eventSessions)
      .values({
        eventId: newEvent.id,
        venueId: venueId || null,
        startTime,
        endTime,
      })
      .returning();

    // Check for conflicts (Flag only, don't block)
    const existingAllocations = await db.query.eventSessions.findMany({
      where: (sessions, { and, eq, or, lte, gte }) => and(
        eq(sessions.venueId, venueId),
        or(
          and(lte(sessions.startTime, startTime), gte(sessions.endTime, startTime)),
          and(lte(sessions.startTime, endTime), gte(sessions.endTime, endTime))
        )
      )
    });

    const isConflict = existingAllocations.length > 0;

    await db.insert(schema.venueAllocations)
      .values({
        venueId,
        eventSessionId: newSession.id,
        status: isConflict ? "PENDING_APPROVAL" as any : "PENDING_APPROVAL" // FLAG logic
      });

    // 3. Initiate Governance Workflow
    // Workflow A (Club): Coordinator -> LEAD_SE -> AO
    // Workflow B (Technical): Faculty -> PROGRAM_HEAD -> HOD -> LEAD_SE -> AO
    
    let firstApproverRole: string;
    if (userRole === 'STUDENT_COORDINATOR') {
      firstApproverRole = 'LEAD_SE';
    } else if (userRole === 'FACULTY') {
      firstApproverRole = 'PROGRAM_HEAD';
    } else {
      firstApproverRole = 'LEAD_SE'; // Default fallback
    }

    await db.insert(schema.eventApprovals)
      .values({
        eventId: newEvent.id,
        approverRole: firstApproverRole as any,
        status: "PENDING_APPROVAL",
      });

    // 4. Log the Audit
    await db.insert(schema.auditLogs)
      .values({
        action: "EVENT_CREATED",
        entityId: newEvent.id,
        userId: userId,
        details: { workflow: userRole === 'FACULTY' ? 'Workflow B' : 'Workflow A', conflict: isConflict }
      });

    revalidatePath("/dashboard");
    revalidatePath("/my-events");
    
    return { success: true, eventId: newEvent.id };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get all pending approvals for a specific role
 */
export async function getPendingApprovalsAction(role: string) {
  try {
    const approvals = await db.query.eventApprovals.findMany({
      where: (approvals, { and, eq }) => and(
        eq(approvals.approverRole, role as any),
        eq(approvals.status, "PENDING_APPROVAL")
      ),
      with: {
        event: true
      }
    });

    return { success: true, approvals };
  } catch (error) {
    console.error("Failed to fetch approvals:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Process an approval/rejection for an event
 */
export async function processApprovalAction(approvalId: string, status: "APPROVED" | "REJECTED", comments: string) {
  try {
    const [approval] = await db.update(schema.eventApprovals)
      .set({ status, comments, updatedAt: new Date() })
      .where(eq(schema.eventApprovals.id, approvalId))
      .returning();

    const event = await db.query.events.findFirst({
      where: eq(schema.events.id, approval.eventId),
      with: {
        creator: true
      }
    });

    if (!event) throw new Error("Event not found");

    if (status === "REJECTED") {
      await db.update(schema.events)
        .set({ status: "REJECTED" })
        .where(eq(schema.events.id, event.id));
    } else {
      // Logic for next in chain
      // Workflow A: Coordinator -> LEAD_SE -> AO
      // Workflow B: Faculty -> PROGRAM_HEAD -> HOD -> LEAD_SE -> AO
      
      const chainA = ['STUDENT_COORDINATOR', 'LEAD_SE', 'AO'];
      const chainB = ['FACULTY', 'PROGRAM_HEAD', 'HOD', 'LEAD_SE', 'AO'];
      
      const currentChain = event.creator.role === 'FACULTY' ? chainB : chainA;
      const currentIndex = currentChain.indexOf(approval.approverRole);
      
      if (currentIndex !== -1 && currentIndex < currentChain.length - 1) {
        const nextRole = currentChain[currentIndex + 1];
        await db.insert(schema.eventApprovals)
          .values({
            eventId: event.id,
            approverRole: nextRole as any,
            status: "PENDING_APPROVAL",
          });
      } else {
        // Last step in chain: Publish event
        await db.update(schema.events)
          .set({ status: "PUBLISHED" })
          .where(eq(schema.events.id, event.id));
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to process approval:", error);
    return { success: false, error: (error as Error).message };
  }
}
