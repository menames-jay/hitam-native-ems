"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { asc, gte } from "drizzle-orm";

export async function getCalendarSessionsAction() {
  try {
    const sessions = await db.query.eventSessions.findMany({
      where: gte(schema.eventSessions.startTime, new Date()), // Only upcoming
      with: {
        event: true,
        venue: true
      },
      orderBy: [asc(schema.eventSessions.startTime)]
    });

    return { success: true, sessions };
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return { success: false, error: (error as Error).message };
  }
}
