"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getParticipationHistoryAction(studentId: string) {
  try {
    const history = await db.query.attendanceRecords.findMany({
      where: eq(schema.attendanceRecords.studentId, studentId),
      with: {
        eventSession: {
          with: {
            event: {
              with: {
                creator: true
              }
            },
            venue: true
          }
        }
      },
      orderBy: [desc(schema.attendanceRecords.scannedAt)]
    });

    return { success: true, history };
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return { success: false, error: (error as Error).message };
  }
}
