import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in environment variables.");
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function runUAT() {
  const studentId = '8JM0xO6btImJLGa3h5tupIWS3YvAJg3T'; // Student Role
  const testDate = '2026-04-23'; // Thursday
  const testHour = 2; // Database Systems (10:00 - 11:00)

  console.log(`\n🚀 STARTING UAT AT-06: Time-Shifted Attendance Mapping`);
  console.log(`-----------------------------------------------------`);
  console.log(`Target: ${testDate} | Hour ${testHour} (Database Systems)`);

  try {
    // 1. Cleanup previous test records for this student/date to ensure clean state
    await sql`DELETE FROM attendance_records WHERE student_id = ${studentId} AND scanned_at::date = ${testDate}`;

    // 1b. Ensure timetable is full
    await sql`DELETE FROM academic_timetables`;
    await sql`INSERT INTO academic_timetables (department_id, class_year, section, day_of_week, slot_number, start_time, end_time, subject) VALUES 
      ('dept_cse', 3, 'A', 1, 1, '09:00', '10:00', 'Machine Learning'), 
      ('dept_cse', 3, 'A', 1, 2, '10:00', '11:00', 'Compiler Design'), 
      ('dept_cse', 3, 'A', 2, 1, '09:00', '10:00', 'Software Engineering'), 
      ('dept_cse', 3, 'A', 3, 1, '09:00', '10:00', 'Machine Learning'), 
      ('dept_cse', 3, 'A', 3, 2, '10:00', '11:00', 'Compiler Design'), 
      ('dept_cse', 3, 'A', 3, 3, '11:15', '12:15', 'Software Engineering'), 
      ('dept_cse', 3, 'A', 3, 4, '12:15', '13:15', 'Web Technologies'), 
      ('dept_cse', 3, 'A', 3, 5, '14:00', '15:00', 'Cyber Security'), 
      ('dept_cse', 3, 'A', 3, 6, '15:00', '16:00', 'DevOps'), 
      ('dept_cse', 3, 'A', 4, 1, '09:00', '10:00', 'Operating Systems'), 
      ('dept_cse', 3, 'A', 4, 2, '10:00', '11:00', 'Database Systems'), 
      ('dept_cse', 3, 'A', 4, 3, '11:15', '12:15', 'Computer Networks'), 
      ('dept_cse', 3, 'A', 4, 4, '12:15', '13:15', 'AI & ML'), 
      ('dept_cse', 3, 'A', 4, 5, '14:00', '15:00', 'Ethics & Values'), 
      ('dept_cse', 3, 'A', 4, 6, '15:00', '16:00', 'Seminar'), 
      ('dept_cse', 3, 'A', 5, 1, '09:00', '10:00', 'Professional Communication'), 
      ('dept_cse', 3, 'A', 5, 2, '10:00', '11:00', 'Cloud Computing'), 
      ('dept_cse', 3, 'A', 5, 3, '11:15', '12:15', 'Design Thinking'), 
      ('dept_cse', 3, 'A', 5, 4, '12:15', '13:15', 'Technical Skills'), 
      ('dept_cse', 3, 'A', 5, 5, '14:00', '15:00', 'Affinity Hour'), 
      ('dept_cse', 3, 'A', 5, 6, '15:00', '16:00', 'Club Activities')`;

    console.log('✅ Cleaned up old test records and re-seeded timetable.');

    // 2. Insert Simulated Event Scan at 10:30 AM IST (05:00 AM UTC)
    const scanTime = `${testDate}T05:00:00.000Z`;
    await sql`
      INSERT INTO attendance_records (id, event_session_id, student_id, status, scanned_at)
      VALUES (gen_random_uuid(), '2883e6ac-8303-41f8-bec0-879e01a11767', ${studentId}, 'PRESENT', ${scanTime})
    `;
    console.log(`✅ Inserted simulated event scan at ${scanTime} (10:30 AM IST)`);

    // 3. Simulate the ERP Page Lookup Logic
    // This replicates the logic in src/app/(dashboard)/attendance/erp/page.tsx

    // DEBUG: List all slots
    const allSlots = await sql`SELECT * FROM academic_timetables`;
    console.log(`📋 Total slots found in DB by script: ${allSlots.length}`);
    if (allSlots.length > 0) {
      console.log(`📋 First slot sample: day=${allSlots[0].day_of_week}, hour=${allSlots[0].slot_number}, section=${allSlots[0].section}`);
    }

    // Fetch Timetable
    console.log(`🔍 Querying timetable: day=4, hour=${testHour}, section=A, dept=dept_cse, year=3`);
    const [slot] = await sql`
      SELECT * FROM academic_timetables 
      WHERE day_of_week = 4 
      AND slot_number = ${testHour} 
      AND section = 'A'
      AND department_id = 'dept_cse'
      AND class_year = 3
    `;

    if (!slot) {
      console.error('❌ FAILED: Timetable slot not found for Thursday Hour 2.');
      return;
    }
    console.log(`✅ Found Timetable Slot: ${slot.subject} (${slot.start_time} - ${slot.end_time})`);

    const start = new Date(testDate);
    const [hS, mS] = slot.start_time.split(':').map(Number);
    start.setHours(hS, mS, 0, 0);

    const end = new Date(testDate);
    const [hE, mE] = slot.end_time.split(':').map(Number);
    end.setHours(hE, mE, 0, 0);

    console.log(`🔍 Searching for event scans between ${start.toISOString()} and ${end.toISOString()}`);

    const records = await sql`
      SELECT * FROM attendance_records
      WHERE student_id = ${studentId}
      AND status = 'PRESENT'
      AND scanned_at >= ${start.toISOString()}
      AND scanned_at <= ${end.toISOString()}
    `;

    // 4. ASSERTION
    if (records.length > 0) {
      console.log(`\n🎉 UAT SUCCESS: Student ${studentId} correctly MAPPED to Database Systems.`);
      console.log(`   Record Found: Scan at ${records[0].scanned_at}`);
    } else {
      console.error(`\n❌ UAT FAILED: Student was not mapped. Check timestamp overlaps.`);
    }

  } catch (err) {
    console.error('❌ UAT ERROR:', err);
  } finally {
    process.exit(0);
  }
}

runUAT();
