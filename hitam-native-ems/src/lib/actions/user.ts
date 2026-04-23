"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Toggles the user's notification preference in the institutional ledger.
 */
export async function toggleNotificationsAction(userId: string, enabled: boolean) {
  try {
    await db.update(schema.user)
      .set({ notificationsEnabled: enabled })
      .where(eq(schema.user.id, userId));
    
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle notifications:", error);
    return { success: false, error: (error as Error).message };
  }
}
