import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../src/lib/db/schema";
import { nanoid } from "nanoid";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL missing");

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function seedStudents() {
  console.log("🌱 Seeding 40 generic students for CSE-B Year 3...");

  const students = Array.from({ length: 40 }).map((_, i) => {
    const id = nanoid();
    const studentNum = (i + 1).toString().padStart(2, '0');
    return {
      id,
      name: `Student ${studentNum}`,
      email: `student${studentNum}@hitam.edu.in`,
      emailVerified: true,
      role: "STUDENT" as const,
      departmentId: "dept_cse",
      section: "B",
      classYear: 3,
      rollNumber: `22H61A05${studentNum}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  try {
    // Check if dept_cse exists, create if not
    await db.insert(schema.departments).values({
      id: "dept_cse",
      name: "Computer Science and Engineering",
      code: "CSE"
    }).onConflictDoNothing();

    await db.insert(schema.user).values(students).onConflictDoNothing();
    console.log("✅ Successfully seeded 40 students!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
  process.exit(0);
}

seedStudents();
