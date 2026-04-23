"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, inArray, sql, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Generates a random 6-character alphanumeric code for manual fallback.
 */
function generateFallbackCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Starts an attendance session for an event session.
 * Generates both a secure QR token and a 6-character fallback code.
 */
export async function generateAttendanceTokenAction(eventSessionId: string, durationMinutes: number = 60) {
  try {
    const { getServerSession } = await import("@/lib/auth/role");
    const session = await getServerSession();

    if (!session) throw new Error("Unauthorized: Please log in to manage tokens");

    // Verify creator or faculty authority
    const eventSession = await db.query.eventSessions.findFirst({
        where: eq(schema.eventSessions.id, eventSessionId),
        with: { event: true }
    });

    if (!eventSession) throw new Error("Event session not found");
    // Only creator or an admin can generate tokens
    if (eventSession.event.createdBy !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "FACULTY") {
       throw new Error("Unauthorized: Only event creators or faculty can generate attendance tokens");
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fallbackCode = generateFallbackCode();
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const [newToken] = await db.insert(schema.attendanceTokens).values({
      eventSessionId,
      token,
      fallbackCode,
      expiresAt,
    }).returning();

    revalidatePath("/attendance/manage");
    return { success: true, token: newToken.token, fallbackCode: newToken.fallbackCode };
  } catch (error) {
    console.error("Failed to generate token:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Records attendance for a student using either a QR token or a fallback code.
 */
export async function recordAttendance(
  studentId: string, 
  tokenOrCode: string,
  eventSessionId?: string
) {
  const { getServerSession } = await import("@/lib/auth/role");
  const session = await getServerSession();

  if (!session) throw new Error("Unauthorized: Please log in to mark attendance");
  const activeStudentId = session.user.id;
  
  try {
    // 1. Find the accurate token (Direct lookup by value)
    const normalizedInput = tokenOrCode.trim().toUpperCase();
    
    // We search across all active tokens for one that matches either the secure token or the fallback code
    const activeToken = await db.query.attendanceTokens.findFirst({
      where: and(
        eventSessionId ? eq(schema.attendanceTokens.eventSessionId, eventSessionId) : undefined,
        sql`${schema.attendanceTokens.token} = ${tokenOrCode} OR UPPER(${schema.attendanceTokens.fallbackCode}) = ${normalizedInput}`,
        gte(schema.attendanceTokens.expiresAt, new Date())
      ),
      with: {
        session: true
      }
    });

    if (!activeToken) throw new Error("Invalid or expired attendance token");

    // 2. REGISTRATION CHECK: PRD requires students be registered to mark attendance
    const registration = await db.query.registrations.findFirst({
      where: and(
        eq(schema.registrations.studentId, activeStudentId),
        eq(schema.registrations.eventId, activeToken.session.eventId)
      )
    });

    if (!registration && session.user.role !== "ADMIN") {
       throw new Error("Unauthorized: You must be registered for this event to mark attendance");
    }

    // 3. Check if student is already marked present
    const existing = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(schema.attendanceRecords.eventSessionId, activeToken.eventSessionId),
        eq(schema.attendanceRecords.studentId, activeStudentId)
      )
    });

    if (existing) return { success: true, status: "ALREADY_PRESENT" };

    // 4. Record attendance
    const scannedAt = new Date();
    
    // Fetch event session for hash calculation
    const sessionDetail = await db.query.eventSessions.findFirst({
       where: eq(schema.eventSessions.id, activeToken.eventSessionId),
       with: { event: true }
    });

    if (!sessionDetail) throw new Error("Critical: Session not found during recording");

    // Generate Institutional Badge Signature
    const { generateBadgeHash } = await import("@/lib/services/credential-service");
    const { sendBadgeEmail } = await import("@/lib/services/email-service");

    const hash = generateBadgeHash(activeStudentId, sessionDetail.eventId, scannedAt);

    const [newRecord] = await db.insert(schema.attendanceRecords).values({
      eventSessionId: activeToken.eventSessionId,
      studentId: activeStudentId,
      status: "PRESENT",
      credentialHash: hash,
      scannedAt,
    }).returning();

    // 5. Fire-and-forget institutional email (Async)
    // We don't await here to keep the scanner snappy
    sendBadgeEmail(sessionDetail.event.createdBy, sessionDetail.event.title, hash).catch(console.error); 
    
    // Fetch student email
    const student = await db.query.user.findFirst({ where: eq(schema.user.id, activeStudentId) });
    if (student?.email) {
      sendBadgeEmail(student.email, sessionDetail.event.title, hash).catch(console.error);
    }

    // AUDIT LOG
    await db.insert(schema.auditLogs).values({
      action: "ATTENDANCE_SCANNED",
      entityId: activeToken.eventSessionId,
      userId: activeStudentId,
      details: { status: "SUCCESS", source: "QR", credentialId: newRecord.id }
    });

    revalidatePath("/attendance/scan");
    return { success: true, status: "SUCCESS", credentialId: newRecord.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Fetches event attendees matching a specific academic time slot.
 * This is used for auto-mapping attendance in the Faux ERP view.
 */
export async function getMappedAttendance(date: Date, startTime: Date, endTime: Date) {
  // Find all event sessions that overlap with this academic time slot
  const overlappingSessions = await db.query.eventSessions.findMany({
    where: and(
       gte(schema.eventSessions.startTime, startTime),
       lte(schema.eventSessions.endTime, endTime)
    ),
  });

  if (overlappingSessions.length === 0) return [];

  const sessionIds = overlappingSessions.map(s => s.id);
  if (sessionIds.length === 0) return [];

  // Fetch all attendance records for these sessions
  const records = await db.query.attendanceRecords.findMany({
    where: inArray(schema.attendanceRecords.eventSessionId, sessionIds),
    with: {
      student: true
    }
  });

  return records;
}

/**
 * Finalizes the attendance for a class session.
 * Created by Faculty to sync the event-mapped attendance to the ERP ledger.
 */
export async function submitToErp(
  eventSessionId?: string,
  academicContext?: {
    deptId: string;
    year: number;
    section: string;
    slot: number;
    date: Date;
  },
  overrides?: { studentId: string; status: "PRESENT" | "ABSENT" }[]
) {
  const { getServerSession } = await import("@/lib/auth/role");
  const session = await getServerSession();

  if (!session) throw new Error("Unauthorized: Faculty session required");
  if (session.user.role !== "FACULTY" && session.user.role !== "ADMIN") {
     throw new Error("Unauthorized: Only Faculty or Admins can submit to ERP");
  }

  try {
    const referenceDate = academicContext?.date || new Date();

    // 14-DAY RULE ENFORCEMENT
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    if (referenceDate < fourteenDaysAgo && session.user.role !== "ADMIN") {
        throw new Error("Lockout: Attendance cannot be submitted or edited after 14 days.");
    }

    const startOfDay = new Date(referenceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(referenceDate);
    endOfDay.setHours(23, 59, 59, 999);

    // CHECK FOR APPROVAL LOCK: If PH has already approved, Faculty cannot edit anymore
    if (academicContext) {
        const existing = await db.query.attendanceSubmissions.findFirst({
            where: and(
                eq(schema.attendanceSubmissions.departmentId, academicContext.deptId),
                eq(schema.attendanceSubmissions.classYear, academicContext.year),
                eq(schema.attendanceSubmissions.section, academicContext.section),
                eq(schema.attendanceSubmissions.slotNumber, academicContext.slot),
                gte(schema.attendanceSubmissions.date, startOfDay),
                lte(schema.attendanceSubmissions.date, endOfDay)
            )
        });

        if (existing?.isApproved && session.user.role !== "ADMIN") {
            throw new Error("Governance Lock: This record has already been approved by the Program Head and is now immutable.");
        }
    }

    // Implementation of final submission to attendanceSubmissions (UPSERT)
    // We use a manual check and delete/insert for cross-dialect compatibility if needed, 
    // or use the unique constraint we added.
    if (academicContext) {
        await db.delete(schema.attendanceSubmissions).where(and(
            eq(schema.attendanceSubmissions.departmentId, academicContext.deptId),
            eq(schema.attendanceSubmissions.classYear, academicContext.year),
            eq(schema.attendanceSubmissions.section, academicContext.section),
            eq(schema.attendanceSubmissions.slotNumber, academicContext.slot),
            gte(schema.attendanceSubmissions.date, startOfDay),
            lte(schema.attendanceSubmissions.date, endOfDay)
        ));
    }

    await db.insert(schema.attendanceSubmissions).values({
      eventSessionId: eventSessionId || null,
      facultyId: session.user.id,
      departmentId: academicContext?.deptId,
      classYear: academicContext?.year,
      section: academicContext?.section,
      slotNumber: academicContext?.slot,
      date: referenceDate,
      isApproved: false,
      attendanceData: overrides, // This will now contain { status: "DRAFT" | "SUBMITTED", records: [...] }
      submittedAt: new Date(),
    });

    // AUDIT LOG
    const isSubmitted = (overrides as any)?.status === "SUBMITTED";
    await db.insert(schema.auditLogs).values({
      action: isSubmitted ? "ERP_SYNC_SUBMITTED" : "ERP_SYNC_DRAFTED",
      entityId: academicContext ? `${academicContext.deptId}-${academicContext.year}-${academicContext.slot}` : (eventSessionId || "unknown"),
      userId: session.user.id,
      details: { 
        studentCount: Array.isArray(overrides) ? overrides.length : ((overrides as any)?.records?.length || 0), 
        hasOverrides: true,
        type: academicContext ? "ACADEMIC" : "EVENT"
      }
    });

    revalidatePath("/attendance/erp");
    revalidatePath("/attendance");
    return { success: true };
  } catch (error) {
    console.error("ERP Submit Failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Program Head Action: Approves an ERP attendance submission.
 * Once approved, the record is locked for Faculty editing.
 */
export async function approveErpSubmission(submissionId: string) {
  const { getServerSession } = await import("@/lib/auth/role");
  const session = await getServerSession();

  if (!session) throw new Error("Unauthorized: PH session required");
  if (session.user.role !== "PROGRAM_HEAD" && session.user.role !== "ADMIN") {
     throw new Error("Unauthorized: Only Program Heads or Admins can approve attendance.");
  }

  try {
    await db.update(schema.attendanceSubmissions)
      .set({ 
        isApproved: true, 
        approvedBy: session.user.id 
      })
      .where(eq(schema.attendanceSubmissions.id, submissionId));

    // AUDIT LOG
    await db.insert(schema.auditLogs).values({
      action: "ERP_SYNC_APPROVED",
      entityId: submissionId,
      userId: session.user.id,
      details: { status: "APPROVED" }
    });

    revalidatePath("/attendance/erp"); // Revalidate the review page
    return { success: true };
  } catch (error) {
    console.error("Approval Failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Institutional Reporting Engine: Generates an on-the-fly CSV digest.
 * Includes student participation records and academic synchronization status.
 */
export async function downloadAttendanceAction(eventSessionId: string) {
  try {
    // 1. Fetch Session Details
    const session = await db.query.eventSessions.findFirst({
      where: eq(schema.eventSessions.id, eventSessionId),
      with: { event: true }
    });

    if (!session) throw new Error("Session not found");

    // 2. Fetch Attendance Records with Student data
    const records = await db.query.attendanceRecords.findMany({
      where: eq(schema.attendanceRecords.eventSessionId, eventSessionId),
      with: { student: true }
    });

    // 3. Check for ERP Synchronization
    const submission = await db.query.attendanceSubmissions.findFirst({
      where: eq(schema.attendanceSubmissions.eventSessionId, eventSessionId)
    });

    const syncStatus = submission ? "SYNCHRONIZED" : "PENDING";

    // 4. Generate CSV String
    const headers = ["Roll Number", "Name", "Department", "Status", "Scanned At", "Institutional Sync"];
    const rows = records.map(r => [
      r.student.rollNumber || "N/A",
      r.student.name,
      r.student.departmentId || "GEN",
      r.status,
      r.scannedAt.toISOString(),
      syncStatus
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    return { 
      success: true, 
      csv: csvContent, 
      filename: `attendance_${session.event.title.replace(/\s+/g, '_')}_${session.startTime.toISOString().split('T')[0]}.csv` 
    };
  } catch (error) {
    console.error("Report generation failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Fetches basic info about an attendance session for the scanner HUD.
 */
export async function getAttendanceSessionInfo(sessionId: string) {
  const session = await db.query.eventSessions.findFirst({
    where: eq(schema.eventSessions.id, sessionId),
    with: {
      event: true,
      venue: true
    }
  });
  
  if (!session) return null;
  
  return {
    eventTitle: session.event.title,
    venueName: session.venue?.name || "Main Campus",
    startTime: session.startTime
  };
}

/**
 * Fetches all pending attendance submissions for Program Head review.
 */
export async function getPendingAttendanceSubmissions() {
  try {
    const { getServerSession } = await import("@/lib/auth/role");
    const session = await getServerSession();
    if (!session) throw new Error("Unauthorized");

    const { desc } = await import("drizzle-orm");
    const submissions = await db.query.attendanceSubmissions.findMany({
      where: and(
        eq(schema.attendanceSubmissions.isApproved, false),
        eq(schema.attendanceSubmissions.departmentId, session.user.departmentId || "dept_cse")
      ),
      with: { faculty: true },
      orderBy: [desc(schema.attendanceSubmissions.submittedAt)]
    });

    // Filter out drafts - only show legacy array formats or explicitly SUBMITTED records
    const filteredSubmissions = submissions.filter(s => {
      if (!s.attendanceData) return false;
      if (Array.isArray(s.attendanceData)) return true; // Legacy
      return (s.attendanceData as any).status === "SUBMITTED";
    });

    return { success: true, submissions: filteredSubmissions };
  } catch (error) {
    console.error("Failed to fetch pending submissions:", error);
    return { success: false, error: (error as Error).message };
  }
}
