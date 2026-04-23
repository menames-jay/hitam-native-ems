"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function listVenuesAction() {
  try {
    const venues = await db.query.venues.findMany({
      orderBy: (venues, { desc }) => [desc(venues.createdAt)]
    });
    return { success: true, venues };
  } catch (error) {
    console.error("Failed to list venues:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function createVenueAction(name: string, capacity: number, adminId: string) {
  try {
    const [newVenue] = await db.insert(schema.venues)
      .values({ name, capacity, createdAt: new Date() })
      .returning();

    await db.insert(schema.auditLogs)
      .values({
        action: "VENUE_CREATED",
        entityId: newVenue.id,
        userId: adminId,
        details: { name, capacity }
      });

    revalidatePath("/venues");
    return { success: true };
  } catch (error) {
    console.error("Failed to create venue:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteVenueAction(id: string, adminId: string) {
  try {
    await db.delete(schema.venues).where(eq(schema.venues.id, id));
    
    await db.insert(schema.auditLogs)
      .values({
        action: "VENUE_DELETED",
        entityId: id,
        userId: adminId
      });

    revalidatePath("/venues");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete venue:", error);
    return { success: false, error: (error as Error).message };
  }
}
