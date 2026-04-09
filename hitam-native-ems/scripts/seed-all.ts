import "dotenv/config";
import { seedVenues, seedTestData } from "../src/lib/db/seed";

async function main() {
  try {
    await seedVenues();
    await seedTestData();
    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

main();
