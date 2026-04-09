import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

/**
 * Seed foundational venues for the HITAM campus.
 */
export async function seedVenues() {
  const venues = [
    { name: "Main Auditorium", capacity: 500 },
    { name: "Seminar Hall 1", capacity: 120 },
    { name: "Seminar Hall 2", capacity: 80 },
    { name: "Open Air Theatre", capacity: 1000 },
    { name: "Conference Room A", capacity: 30 },
    { name: "Computer Lab 4", capacity: 60 },
  ];

  console.log("Seeding venues...");
  
  for (const v of venues) {
    // Check if venue exists (naive check)
    const existing = await db.query.venues.findFirst({
      where: (venues, { eq }) => eq(venues.name, v.name)
    });

    if (!existing) {
      await db.insert(schema.venues).values(v);
    }
  }

  console.log("Venues seeded.");
}

export async function seedTestData() {
  console.log("Seeding test data...");

  // 1. Create a mock coordinator
  const [mockCoord] = await db.insert(schema.user).values({
    id: "user_mock_123",
    name: "Mock Coordinator",
    email: "coord@hitam.org",
    emailVerified: true,
    role: "STUDENT_COORDINATOR",
    createdAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoNothing().returning();

  // 2. Create a mock event
  const [mockEvent] = await db.insert(schema.events).values({
    title: "Workshop: Advanced Drizzle ORM",
    description: "Deep dive into type-safe SQL with Drizzle. Essential for HITAM EMS developers.",
    status: "PENDING_APPROVAL",
    createdBy: "user_mock_123",
    isPaid: true,
    price: 299,
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80"
  }).returning();

  const [venue] = await db.query.venues.findMany({ limit: 1 });

  // 3. Create a session
  const [session] = await db.insert(schema.eventSessions).values({
    eventId: mockEvent.id,
    venueId: venue.id,
    startTime: new Date(Date.now() + 86400000), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 7200000), // +2 hours
  }).returning();

  // 4. Create an approval request for Lead SE
  await db.insert(schema.eventApprovals).values({
    eventId: mockEvent.id,
    approverRole: "LEAD_SE",
    status: "PENDING_APPROVAL",
  });

  console.log("Test data seeded.");
}
