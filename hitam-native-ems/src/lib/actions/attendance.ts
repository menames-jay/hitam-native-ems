"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

/**
 * Attendance System: Token Generation & Verification
 */

export async function generateAttendanceTokenAction(eventSessionId: string) {
  try {
    // 1. Check for existing active token
    const existing = await db.query.attendanceTokens.findFirst({
      where: (tokens, { and, eq, gt }) => and(
        eq(tokens.eventSessionId, eventSessionId),
        gt(tokens.expiresAt, new Date())
      )
    });

    if (existing) {
      return { success: true, token: existing.token, fallbackCode: existing.fallbackCode };
    }

    // 2. Create new token (valid for 30 minutes)
    const token = nanoid(32);
    const fallbackCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const [newToken] = await db.insert(schema.attendanceTokens)
      .values({
        eventSessionId,
        token,
        fallbackCode,
        expiresAt,
      })
      .returning();

    return { success: true, token: newToken.token, fallbackCode: newToken.fallbackCode };
  } catch (error) {
    console.error("Token generation failed:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function logAttendanceAction(tokenOrCode: string, studentId: string) {
  try {
    // 1. Verify token/code
    const activeToken = await db.query.attendanceTokens.findFirst({
      where: (tokens, { and, or, eq, gt }) => and(
        or(
          eq(tokens.token, tokenOrCode),
          eq(tokens.fallbackCode, tokenOrCode)
        ),
        gt(tokens.expiresAt, new Date())
      )
    });

    if (!activeToken) {
      throw new Error("Invalid or expired attendance token.");
    }

    // 2. Check for duplicate record
    const existingRecord = await db.query.attendanceRecords.findFirst({
      where: (recs, { and, eq }) => and(
        eq(recs.eventSessionId, activeToken.eventSessionId),
        eq(recs.studentId, studentId)
      )
    });

    if (existingRecord) {
      return { success: true, alreadyLogged: true };
    }

    // 3. Mark attendance
    await db.insert(schema.attendanceRecords)
      .values({
        eventSessionId: activeToken.eventSessionId,
        studentId,
        status: "PRESENT",
      });

    // 4. Get event details for success UI
    const sessionWithEvent = await db.query.eventSessions.findFirst({
      where: eq(schema.eventSessions.id, activeToken.eventSessionId),
      with: {
        event: true
      }
    });

    revalidatePath("/dashboard");
    return { 
      success: true, 
      alreadyLogged: false,
      eventTitle: sessionWithEvent?.event?.title || "Event",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.error("Attendance logging failed:", error);
    return { success: false, error: (error as Error).message };
  }
}
