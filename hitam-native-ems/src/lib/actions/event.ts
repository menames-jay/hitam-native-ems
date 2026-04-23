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
    const { getServerSession } = await import("@/lib/auth/role");
    const session = await getServerSession();

    if (!session) throw new Error("Unauthorized: Please log in to create events");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string; // 'club' or 'technical'
    const venueId = formData.get("venueId") as string;
    const startTime = new Date(formData.get("startTime") as string);
    const endTime = new Date(formData.get("endTime") as string);
    const isPaid = formData.get("isPaid") === "on";
    const price = isPaid ? parseInt(formData.get("price") as string) : 0;
    
    if (isPaid && isNaN(price)) {
      throw new Error("A valid price is required for paid events");
    }
    
    // 1. Create the Event record
    const eventValues: any = {
      title,
      description,
      status: "PENDING_APPROVAL",
      createdBy: session.user.id,
      category: (type?.toUpperCase() === 'CLUB' ? 'CLUB' : 'TECHNICAL'),
      isPaid,
      price: price || 0,
      coverImage: "https://via.placeholder.com/1200x600?text=Institutional+Event+Poster",
      updatedAt: new Date(),
    };

    const [newEvent] = await db.insert(schema.events)
      .values(eventValues)
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
    // CLUB: LEAD_SE -> AO
    // TECHNICAL: PROGRAM_HEAD -> HOD -> LEAD_SE -> AO
    
    let firstApproverRole: string;
    if (newEvent.category === 'CLUB') {
      firstApproverRole = 'LEAD_SE';
    } else {
      // TECHNICAL / Others
      firstApproverRole = 'PROGRAM_HEAD';
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
        userId: session.user.id,
        details: { category: newEvent.category, firstApprover: firstApproverRole, conflict: isConflict }
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
        event: {
          with: { creator: true }
        }
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
  const { getServerSession } = await import("@/lib/auth/role");
  const session = await getServerSession();

  if (!session) throw new Error("Unauthorized: Approval required");

  try {
    const existingApproval = await db.query.eventApprovals.findFirst({
        where: eq(schema.eventApprovals.id, approvalId),
    });

    if (!existingApproval) throw new Error("Approval record not found");
    if (existingApproval.approverRole !== session.user.role && session.user.role !== "ADMIN") {
        throw new Error(`Unauthorized: This event requires approval from ${existingApproval.approverRole}`);
    }

    const [approval] = await db.update(schema.eventApprovals)
      .set({ status, comments, updatedAt: new Date(), approvedBy: session.user.id })
      .where(eq(schema.eventApprovals.id, approvalId))
      .returning();

    const event = await db.query.events.findFirst({
      where: eq(schema.events.id, approval.eventId),
    });

    if (!event) throw new Error("Event not found");

    if (status === "REJECTED") {
      await db.update(schema.events)
        .set({ status: "REJECTED" })
        .where(eq(schema.events.id, event.id));
    } else {
      // Logic for next in chain
      // CLUB: LEAD_SE -> AO
      // TECHNICAL: PROGRAM_HEAD -> HOD -> LEAD_SE -> AO
      
      const clubChain = ['LEAD_SE', 'AO'];
      const techChain = ['PROGRAM_HEAD', 'HOD', 'LEAD_SE', 'AO'];
      
      const currentChain = event.category === 'CLUB' ? clubChain : techChain;
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
    revalidatePath("/approvals");
    revalidatePath("/approvals/clubs");
    revalidatePath("/approvals/technical");
    return { success: true };
  } catch (error) {
    console.error("Failed to process approval:", error);
    return { success: false, error: (error as Error).message };
  }
}
