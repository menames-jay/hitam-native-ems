"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, inArray, sql, and, gte } from "drizzle-orm";

/**
 * Analytics for HODs: Aggregates data for the entire department
 */
export async function getDepartmentMetricsAction(userId: string) {
  try {
    // 1. Get current user's department
    const currentUser = await db.query.user.findFirst({
      where: eq(schema.user.id, userId)
    });

    if (!currentUser || !currentUser.departmentId) {
      throw new Error("Department not assigned.");
    }

    const deptId = currentUser.departmentId;

    // 2. Find all users in the same department
    const deptUsers = await db.query.user.findMany({
      where: eq(schema.user.departmentId, deptId),
      columns: { id: true }
    });

    const userIds = deptUsers.map(u => u.id);

    if (userIds.length === 0) return { success: true, data: { totalEvents: 0, totalRegistrations: 0, totalRevenue: 0 } };

    // 3. Aggregate Event Stats
    const deptEvents = await db.query.events.findMany({
      where: inArray(schema.events.createdBy, userIds),
      with: {
        registrations: true
      }
    });

    const totalEvents = deptEvents.length;
    const totalRegistrations = deptEvents.reduce((acc, event) => acc + event.registrations.length, 0);

    // 4. Aggregate Revenue (Paid Events)
    const eventIds = deptEvents.map(e => e.id);
    let totalRevenue = 0;

    if (eventIds.length > 0) {
      const revenueData = await db
        .select({
          sum: sql<number>`sum(${schema.paymentRecords.amount})`
        })
        .from(schema.paymentRecords)
        .innerJoin(
          schema.registrations,
          eq(schema.registrations.id, schema.paymentRecords.registrationId)
        )
        .where(
          and(
            inArray(schema.registrations.eventId, eventIds),
            eq(schema.paymentRecords.status, "SUCCESS")
          )
        );
      
      totalRevenue = revenueData[0]?.sum || 0;
    }

    return {
      success: true,
      data: {
        departmentName: currentUser.departmentId || "General",
        totalEvents,
        totalRegistrations,
        totalRevenue,
        activeEvents: deptEvents.filter(e => e.status === "PUBLISHED").length
      }
    };

  } catch (error) {
    console.error("Failed to fetch department metrics:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Participation Trends for Charts: Registrations per day for the last 30 days
 */
export async function getParticipationTrendsAction(userId: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await db
      .select({
        date: sql<string>`DATE(${schema.registrations.createdAt})`,
        count: sql<number>`count(*)`
      })
      .from(schema.registrations)
      .where(gte(schema.registrations.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${schema.registrations.createdAt})`)
      .orderBy(sql`DATE(${schema.registrations.createdAt})`);

    return { success: true, data: trends };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Category Distribution for Pie Charts
 */
export async function getCategoryDistributionAction(userId: string) {
  try {
    const distribution = await db
      .select({
        category: schema.events.category,
        count: sql<number>`count(*)`
      })
      .from(schema.events)
      .groupBy(schema.events.category);

    return { success: true, data: distribution };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}


