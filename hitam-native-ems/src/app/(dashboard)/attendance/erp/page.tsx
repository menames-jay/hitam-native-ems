import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { ErpAttendanceTable } from "@/components/attendance/erp-table";

export default async function ErpAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    hour?: string;
    mode?: "mark" | "review";
    section?: string;
    year?: string;
    dept?: string;
    subject?: string;
  }>;
}) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const resolvedParams = await searchParams;
  const currentHour = parseInt(resolvedParams.hour || "6");
  const mode = resolvedParams.mode || "mark";
  const section = resolvedParams.section || "B";
  const classYear = parseInt(resolvedParams.year || "3");
  const departmentId = resolvedParams.dept || "dept_cse";

  // WAVE 51: SELF-HEALING DATABASE INITIALIZATION
  try {
    await db.execute(sql`SET client_min_messages TO warning;`);

    // Ensure academic_timetables exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS academic_timetables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        department_id TEXT NOT NULL,
        class_year INTEGER NOT NULL,
        section VARCHAR(10) NOT NULL,
        day_of_week INTEGER NOT NULL,
        slot_number INTEGER NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT unique_timetable_slot UNIQUE (department_id, class_year, section, day_of_week, slot_number)
      );
    `);

    // Hardening attendance_submissions for academic snapshots
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_submissions' AND column_name='department_id') THEN
          ALTER TABLE attendance_submissions ADD COLUMN department_id TEXT;
          ALTER TABLE attendance_submissions ADD COLUMN class_year INTEGER;
          ALTER TABLE attendance_submissions ADD COLUMN section TEXT;
          ALTER TABLE attendance_submissions ADD COLUMN slot_number INTEGER;
          ALTER TABLE attendance_submissions ADD COLUMN date TIMESTAMP WITH TIME ZONE;
          ALTER TABLE attendance_submissions ADD COLUMN attendance_data JSONB;
          ALTER TABLE attendance_submissions ALTER COLUMN event_session_id DROP NOT NULL;
          
          -- Ensure uniqueness for snapshots
          ALTER TABLE attendance_submissions ADD CONSTRAINT unique_class_slot 
          UNIQUE (department_id, class_year, section, slot_number, date);
        END IF;
      END $$;
    `);

    const countRes: any = await db.execute(sql`SELECT count(*) FROM academic_timetables WHERE day_of_week = 5`);
    if (parseInt(countRes[0].count) === 0) {
        await db.execute(sql`
            INSERT INTO academic_timetables (department_id, class_year, section, day_of_week, slot_number, start_time, end_time, subject)
            VALUES 
            -- Section A Friday
            ('dept_cse', 3, 'A', 5, 1, '09:00', '10:00', 'Professional Communication'),
            ('dept_cse', 3, 'A', 5, 2, '10:00', '11:00', 'Cloud Computing'),
            ('dept_cse', 3, 'A', 5, 3, '11:15', '12:15', 'Design Thinking'),
            ('dept_cse', 3, 'A', 5, 4, '12:15', '13:15', 'Technical Skills'),
            ('dept_cse', 3, 'A', 5, 5, '14:00', '15:00', 'Affinity Hour'),
            ('dept_cse', 3, 'A', 5, 6, '15:00', '16:00', 'Club Activities'),
            -- Section B Friday
            ('dept_cse', 3, 'B', 5, 1, '09:00', '10:00', 'Network Security'),
            ('dept_cse', 3, 'B', 5, 2, '10:00', '11:00', 'Cloud Infrastructure'),
            ('dept_cse', 3, 'B', 5, 3, '11:15', '12:15', 'Technical English'),
            ('dept_cse', 3, 'B', 5, 4, '12:15', '13:15', 'Soft Skills'),
            ('dept_cse', 3, 'B', 5, 5, '14:00', '15:00', 'Institutional Test Slot'),
            ('dept_cse', 3, 'B', 5, 6, '15:00', '16:00', 'Activity Hour')
        `);
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_session_id UUID NOT NULL,
        student_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PRESENT',
        credential_hash TEXT,
        scanned_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  } catch (healError) {
    console.error("Self-healing failed:", healError);
  }

  // FETCH TIMETABLE DATA
  let dayOfWeek = new Date().getDay();
  // UAT Fallback: If weekend, show Friday schedule
  if (dayOfWeek === 0 || dayOfWeek === 6) dayOfWeek = 5;
  const timetableSlot = await db.query.academicTimetables.findFirst({
    where: and(
      eq(schema.academicTimetables.departmentId, departmentId),
      eq(schema.academicTimetables.classYear, classYear),
      eq(schema.academicTimetables.section, section),
      eq(schema.academicTimetables.dayOfWeek, dayOfWeek),
      eq(schema.academicTimetables.slotNumber, currentHour)
    )
  });

  const subject = resolvedParams.subject || timetableSlot?.subject || "Academic Course";

  // Map Hour to Time Range from Timetable or Fallback (IST to UTC Conversion)
  const getTimeRange = (hour: number) => {
    const start = new Date();
    start.setSeconds(0, 0);

    if (timetableSlot) {
      const [h, m] = timetableSlot.startTime.split(':').map(Number);
      // Timetable is in IST. Convert to UTC for DB comparison (UTC = IST - 5.5h)
      start.setUTCHours(h, m, 0, 0);
      start.setUTCMinutes(start.getUTCMinutes() - 330);
    } else {
      // Fallback: Hour 1 = 9 AM IST = 3:30 AM UTC
      const fallbackHour = 9 + (hour - 1);
      start.setUTCHours(fallbackHour, 0, 0, 0);
      start.setUTCMinutes(start.getUTCMinutes() - 330);
    }

    const end = new Date(start.getTime());
    if (timetableSlot) {
      const [h, m] = timetableSlot.endTime.split(':').map(Number);
      end.setUTCHours(h, m, 0, 0);
      end.setUTCMinutes(end.getUTCMinutes() - 330);
    } else {
      end.setUTCHours(start.getUTCHours() + 1, start.getUTCMinutes(), 0, 0);
    }
    
    return { start, end };
  };

  const { start, end } = getTimeRange(currentHour);

  // Fetch students for the Faculty's responsibility (Dynamic Context)
  const allStudents = await db.query.user.findMany({
    where: and(
      eq(schema.user.role, "STUDENT"),
      eq(schema.user.departmentId, departmentId),
      eq(schema.user.section, section),
      eq(schema.user.classYear, classYear)
    ),
  });

  // Precision Event Sync: Check attendance during THIS specific hour
  let attendanceRecords: any[] = [];
  try {
    attendanceRecords = await db
      .select()
      .from(schema.attendanceRecords)
      .where(
        sql`
          ${schema.attendanceRecords.status} = ${"PRESENT"} AND
          ${schema.attendanceRecords.scannedAt} >= ${start.toISOString()}::timestamp AND
          ${schema.attendanceRecords.scannedAt} <= ${end.toISOString()}::timestamp
        `
      );
  } catch (err) {
    console.error("Mapping fetch failed:", err);
  }

  const eventAttendanceRecords = attendanceRecords.map(r => r.studentId);

  const students = allStudents.map(s => ({
    id: s.id,
    rollNo: s.rollNumber || s.email.split('@')[0].toUpperCase(),
    name: s.name
  }));

  // If in review mode, fetch the submitted attendance
  let existingAttendance;
  if (mode === "review") {
    const submission = await db.query.attendanceSubmissions.findFirst({
      where: and(
        eq(schema.attendanceSubmissions.departmentId, departmentId),
        eq(schema.attendanceSubmissions.classYear, classYear),
        eq(schema.attendanceSubmissions.section, section),
        eq(schema.attendanceSubmissions.slotNumber, currentHour)
      ),
      orderBy: [desc(schema.attendanceSubmissions.submittedAt)]
    });
    
    if (submission?.attendanceData) {
      const data = submission.attendanceData as any;
      existingAttendance = Array.isArray(data) ? data : data.records;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f0a] pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Academic Ledger • Hour {currentHour} • {mode === 'review' ? 'Reviewing' : 'Marking'}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {subject}
            </h1>
            <p className="text-slate-500 font-medium capitalize">
              Section {departmentId.split('_')[1]?.toUpperCase()}-{section} • Year {classYear} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </header>

        {/* Table Component */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-xl overflow-hidden">
          <ErpAttendanceTable
            students={students}
            eventAttendance={eventAttendanceRecords}
            existingAttendance={existingAttendance}
            facultyId={session.user.id}
            currentHour={currentHour}
            mode={mode}
            subject={subject}
            academicMetadata={{
              deptId: departmentId,
              year: classYear,
              section: section,
            }}
          />
        </div>
      </div>
    </div>
  );
}
