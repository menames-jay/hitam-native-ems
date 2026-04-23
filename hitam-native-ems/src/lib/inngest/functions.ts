import { inngest } from "./client";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, lte, gte, sql } from "drizzle-orm";
import { sendPushNotification } from "@/lib/services/push-service";

// 1. Lock Attendance & Archive Events (14-Day Rule)
export const enforce14DayRule = inngest.createFunction(
  { 
    id: "enforce-14-day-rule",
    triggers: [{ cron: "0 0 * * *" }] 
  },
  async ({ step }: any) => {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const archived = await step.run("fetch-and-archive-old-events", async () => {
      // 1. Fetch events to be archived
      const toArchive = await db.query.events.findMany({
        where: and(
          eq(schema.events.status, "COMPLETED"),
          lte(schema.events.updatedAt, fourteenDaysAgo)
        )
      });

      if (toArchive.length === 0) return [];

      // 2. Update status
      await db.update(schema.events)
        .set({ status: "ARCHIVED" })
        .where(
          and(
            eq(schema.events.status, "COMPLETED"),
            lte(schema.events.updatedAt, fourteenDaysAgo)
          )
        );

      // 3. AUDIT LOG: Records Closure
      for (const event of toArchive) {
        await db.insert(schema.auditLogs).values({
          action: "INSTITUTIONAL_RECORDS_LOCKED",
          entityId: event.id,
          userId: "SYSTEM",
          details: { reason: "14_DAY_RULE", archivedAt: new Date().toISOString() }
        });
      }

      return toArchive.map(e => e.id);
    });

    return { archivedCount: archived.length };
  }
);

// 2. Event Reminders (24h & 1h pre-event)
export const eventReminders = inngest.createFunction(
  { 
    id: "event-reminders",
    triggers: [
      { cron: "0 * * * *" }, // Run every hour
      { event: "dev/trigger-reminders" } // Manual trigger for testing
    ]
  },
  async ({ step }: any) => {
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);

    const sessions = await step.run("fetch-upcoming-sessions", async () => {
      return await db.query.eventSessions.findMany({
        where: (sessions, { or, and, gte, lte }) => or(
          // 24h reminders (sessions starting in ~24h)
          and(gte(sessions.startTime, twentyFourHoursLater), lte(sessions.startTime, new Date(twentyFourHoursLater.getTime() + 60 * 60 * 1000))),
          // 1h reminders (sessions starting in ~1h)
          and(gte(sessions.startTime, oneHourLater), lte(sessions.startTime, new Date(oneHourLater.getTime() + 60 * 60 * 1000)))
        ),
        with: {
          event: {
            with: {
              registrations: true
            }
          }
        }
      });
    });

    for (const session of sessions) {
      if (!session.event) continue;
      
      const timeRemaining = Math.round((session.startTime.getTime() - now.getTime()) / (60 * 60 * 1000));
      const label = timeRemaining > 12 ? "24h" : "1h";

      await step.run(`send-reminders-${session.id}-${label}`, async () => {
        for (const reg of session.event.registrations) {
          // 1. Check if already notified for this event/time
          const existing = await db.query.notifications.findFirst({
            where: and(
              eq(schema.notifications.userId, reg.studentId),
              eq(schema.notifications.title, `Event Reminder: ${label}`)
            )
          });

          if (existing) continue;

          // 2. Insert into Internal Ledger
          await db.insert(schema.notifications).values({
            userId: reg.studentId,
            title: `Event Reminder: ${label}`,
            message: `"${session.event.title}" starts in approximately ${label}. Get ready!`,
          });

          // 3. Dispatch Push
          await sendPushNotification(
            reg.studentId,
            `Event Starts in ${label}!`,
            `"${session.event.title}" is coming up soon.`,
            `/events/${session.event.id}`
          );
        }
      });
    }

    return { sessionCount: sessions.length };
  }
);
