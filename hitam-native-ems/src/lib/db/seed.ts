import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@/lib/db/schema";
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL missing");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

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
    category: "TECHNICAL",
    createdBy: "user_mock_123",
    isPaid: true,
    price: 299,
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
    updatedAt: new Date(),
  } as any).returning();

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

export async function seedDepartments() {
  const depts = [
    { id: "dept_cse", name: "Computer Science and Engineering", code: "CSE" },
    { id: "dept_ece", name: "Electronics and Communication Engineering", code: "ECE" },
    { id: "dept_mech", name: "Mechanical Engineering", code: "MECH" },
    { id: "dept_civil", name: "Civil Engineering", code: "CIVIL" },
    { id: "dept_aiml", name: "Artificial Intelligence and Machine Learning", code: "AI&ML" },
  ];

  console.log("Seeding departments...");
  for (const d of depts) {
    await db.insert(schema.departments).values(d).onConflictDoNothing();
  }
}

async function main() {
  try {
    await seedDepartments();
    await seedVenues();
    await seedTestData();

    // Ensure dev-user exists with a department, roll number, and section
    await db.insert(schema.user).values({
      id: "dev-user",
      name: "Development Student",
      email: "student@hitam.org",
      emailVerified: true,
      role: "STUDENT",
      departmentId: "dept_cse",
      rollNumber: "21ZX1A0501",
      classYear: 3,
      section: "A",
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: schema.user.id,
      set: { 
        departmentId: "dept_cse",
        rollNumber: "21ZX1A0501",
        classYear: 3,
        section: "A"
      }
    });

    console.log("✅ Full system seed complete.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
