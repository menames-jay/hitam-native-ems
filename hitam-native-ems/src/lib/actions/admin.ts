"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Institutional Mastery: Update both Role and Details of a user
 */
export async function updateUserAction(userId: string, data: {
  role?: any,
  rollNumber?: string,
  section?: string,
  classYear?: number,
  departmentId?: string,
  adminId: string
}) {
  try {
    const { adminId, ...updates } = data;

    // 1. Perform the update
    await db.update(schema.user)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(schema.user.id, userId));

    // 2. Log the audit
    await db.insert(schema.auditLogs)
      .values({
        action: "USER_IDENTITY_UPDATED",
        entityId: userId,
        userId: adminId,
        details: { 
          changes: updates,
          timestamp: new Date().toISOString()
        }
      });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * List all users with filtering
 */
export async function listUsersAction(query?: string) {
  try {
    const users = await db.query.user.findMany({
      where: (user, { or, ilike }) => query ? or(
        ilike(user.name, `%${query}%`),
        ilike(user.email, `%${query}%`),
        ilike(user.rollNumber, `%${query}%`)
      ) : undefined,
      orderBy: (user, { desc }) => [desc(user.createdAt)],
      limit: 50
    });

    return { success: true, users };
  } catch (error) {
    console.error("Failed to list users:", error);
    return { success: false, error: (error as Error).message };
  }
}
