"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Initiates the multi-role approval chain for an event based on its category.
 */
export async function initiateApprovalChain(eventId: string, category: "CLUB" | "TECHNICAL" | "INSTITUTE") {
  const { getServerSession } = await import("@/lib/auth/role");
  const session = await getServerSession();

  if (!session) throw new Error("Unauthorized: Authentication required");

  // Verify ownership or admin status before initiating
  const event = await db.query.events.findFirst({
    where: eq(schema.events.id, eventId),
  });

  if (!event) throw new Error("Event not found");
  if (event.createdBy !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only the event creator can initiate approvals");
  }

  let firstApproverRole: typeof schema.roleEnum.enumValues[number];

  switch (category) {
    case "CLUB":
      // Workflow A: Club Coord -> Lead SE -> AO
      firstApproverRole = "LEAD_SE";
      break;
    case "TECHNICAL":
      // Workflow B: Faculty -> Program Head -> HOD -> Lead SE -> AO
      firstApproverRole = "PROGRAM_HEAD";
      break;
    case "INSTITUTE":
      // Workflow C: HOD/Lead SE -> AO
      firstApproverRole = "AO";
      break;
    default:
      throw new Error("Invalid event category");
  }

  await db.insert(schema.eventApprovals).values({
    eventId,
    approverRole: firstApproverRole,
    status: "PENDING_APPROVAL",
  });

  // Update event status to PENDING_APPROVAL
  await db.update(schema.events)
    .set({ status: "PENDING_APPROVAL" })
    .where(eq(schema.events.id, eventId));

  revalidatePath("/approvals");
}

/**
 * Processes an approval or rejection from an institutional role.
 * VERIFIES identity and role authority on the server.
 */
export async function processApproval(
  approvalId: string, 
  status: "APPROVED" | "REJECTED", 
  comments?: string,
  _ignoredUserId?: string, // Deprecating client-provided ID
  venueId?: string
) {
  const { getServerSession } = await import("@/lib/auth/role");
  const session = await getServerSession();

  if (!session) throw new Error("Unauthorized: Authentication required to process approvals");

  const approval = await db.query.eventApprovals.findFirst({
    where: eq(schema.eventApprovals.id, approvalId),
    with: {
      event: true
    }
  });

  if (!approval || !approval.event) throw new Error("Approval record not found");

  // ROLE AUTHORITY CHECK
  // Ensure the user actually holds the institutional role required for this step
  if (session.user.role !== approval.approverRole && session.user.role !== "ADMIN") {
    throw new Error(`Unauthorized: This action requires the ${approval.approverRole} role.`);
  }

  // Logic for AO Venue Update
  if (status === "APPROVED" && approval.approverRole === "AO" && venueId) {
    if (session.user.role !== "AO" && session.user.role !== "ADMIN") {
      throw new Error("Unauthorized: Only AO can allocate venues.");
    }
    await db.update(schema.eventSessions)
      .set({ venueId })
      .where(eq(schema.eventSessions.eventId, approval.eventId));
  }

  // 1. Update current approval record
  await db.update(schema.eventApprovals)
    .set({
      status: status === "APPROVED" ? "APPROVED" : "REJECTED",
      approvedBy: session.user.id, // Use verified session ID
      comments: comments || null,
      approvedAt: status === "APPROVED" ? new Date() : null,
      rejectedAt: status === "REJECTED" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.eventApprovals.id, approvalId));

  // AUDIT LOG: Decision Record
  await db.insert(schema.auditLogs).values({
    action: status === "APPROVED" ? "EVENT_APPROVED" : "EVENT_REJECTED",
    entityId: approval.eventId,
    userId: session.user.id,
    details: { 
      role: approval.approverRole, 
      comments: comments || "Sign-off", 
      venueLocked: venueId ? true : false 
    }
  });

  // 2. If rejected, stop chain and update event
  if (status === "REJECTED") {
    await db.update(schema.events)
      .set({ status: "REJECTED" })
      .where(eq(schema.events.id, approval.eventId));
    revalidatePath("/approvals");
    return;
  }

  // 3. If approved, determine next role
  const nextRole = getNextRoleInChain(approval.approverRole, approval.event.category);

  if (nextRole) {
    // Insert next level of approval
    await db.insert(schema.eventApprovals).values({
      eventId: approval.eventId,
      approverRole: nextRole,
      status: "PENDING_APPROVAL",
    });
  } else {
    // Chain complete! Finalize event
    await db.update(schema.events)
      .set({ status: "APPROVED" })
      .where(eq(schema.events.id, approval.eventId));
  }

  revalidatePath("/approvals");
}

function getNextRoleInChain(currentRole: string, category: string): typeof schema.roleEnum.enumValues[number] | null {
  if (category === "CLUB") {
    // Workflow A: LEAD_SE -> AO -> END
    if (currentRole === "LEAD_SE") return "AO";
    return null;
  }

  if (category === "TECHNICAL") {
    // Workflow B: PROGRAM_HEAD -> HOD -> LEAD_SE -> AO -> END
    if (currentRole === "PROGRAM_HEAD") return "HOD";
    if (currentRole === "HOD") return "LEAD_SE";
    if (currentRole === "LEAD_SE") return "AO";
    return null;
  }

  if (category === "INSTITUTE") {
    // Workflow C: AO -> END (since creator is HOD/Lead SE)
    return null;
  }

  return null;
}
