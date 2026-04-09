import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function runMigrate() {
  console.log("Running manual migration...");
  try {
    await sql`ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "is_paid" boolean DEFAULT false NOT NULL;`;
    await sql`ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "price" integer;`;
    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigrate();
