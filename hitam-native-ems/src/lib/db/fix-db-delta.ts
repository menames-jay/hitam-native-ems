import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from "drizzle-orm";
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL missing");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function applyDelta() {
  console.log("🛠️ Applying Database Delta (Wave 23)...");

  try {
    // 1. Update user table
    await db.execute(sql`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "roll_number" varchar(50),
      ADD COLUMN IF NOT EXISTS "class_year" integer,
      ADD COLUMN IF NOT EXISTS "section" varchar(10);
    `);
    console.log("✅ User table enriched.");

    // 2. Create notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL REFERENCES "user"("id"),
        "title" varchar(255) NOT NULL,
        "message" text NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    console.log("✅ Notifications table created.");

    console.log("🚀 Database Delta Applied Successfully!");
    process.exit(0);
  } catch (e) {
    console.error("❌ Delta failed:", e);
    process.exit(1);
  }
}

applyDelta();
