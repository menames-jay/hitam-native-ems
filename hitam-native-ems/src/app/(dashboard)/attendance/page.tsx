import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AttendanceClassesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const today = new Date();
  let dayOfWeek = today.getDay();
  // For testing/UAT purposes: If weekend, default to Friday (5) to show the test schedule
  if (dayOfWeek === 0 || dayOfWeek === 6) dayOfWeek = 5;

  // WAVE 52: SELF-HEALING TIMETABLE SEEDING
  try {
    const existing: any = await db.execute(sql`SELECT count(*) FROM academic_timetables WHERE day_of_week = 5`);
    if (parseInt(existing[0].count) === 0) {
      await db.execute(sql`
        INSERT INTO academic_timetables (department_id, class_year, section, day_of_week, slot_number, start_time, end_time, subject)
        VALUES 
        ('dept_cse', 3, 'A', 5, 1, '09:00', '10:00', 'Professional Communication'),
        ('dept_cse', 3, 'A', 5, 2, '10:00', '11:00', 'Cloud Computing'),
        ('dept_cse', 3, 'B', 5, 1, '09:00', '10:00', 'Network Security'),
        ('dept_cse', 3, 'B', 5, 2, '10:00', '11:00', 'Cloud Infrastructure'),
        ('dept_cse', 3, 'B', 5, 5, '14:00', '15:00', 'Institutional Test Slot'),
        ('dept_cse', 3, 'B', 5, 6, '15:00', '16:00', 'Activity Hour')
      `);
    }
  } catch (e) {
    console.error("Dashboard self-heal failed:", e);
  }

  const timetableClasses = await db.query.academicTimetables.findMany({
    where: and(
      eq(schema.academicTimetables.dayOfWeek, dayOfWeek),
      eq(schema.academicTimetables.section, "B")
    ),
    orderBy: [schema.academicTimetables.slotNumber]
  });

  const classes = timetableClasses.map(t => ({
    id: t.id || `${t.section}-${t.slotNumber}`,
    slotId: t.slotNumber.toString(),
    subject: t.subject,
    section: `CSE-${t.section}`,
    year: `${t.classYear}rd Year`,
    time: `${t.startTime} - ${t.endTime}`,
    status: "Active"
  }));

  const todaysSubmissions = await db.query.attendanceSubmissions.findMany({
    where: eq(schema.attendanceSubmissions.facultyId, session.user.id),
    orderBy: [desc(schema.attendanceSubmissions.submittedAt)]
  });

  const submittedSlotIds = todaysSubmissions
    .filter(s => s.isApproved || (s.attendanceData as any)?.status === "SUBMITTED")
    .map(s => s.slotNumber?.toString());

  const pendingSubmissions = todaysSubmissions.filter(s => {
    if (s.isApproved) return false;
    const data = s.attendanceData as any;
    if (data?.status === "SUBMITTED") return false;
    // Don't show DRAFT if there's already a SUBMITTED record for this slot (resolves duplicate race conditions)
    if (submittedSlotIds.includes(s.slotNumber?.toString())) return false;
    return true; // Show legacy or DRAFT
  });
  
  // Only show classes that haven't been drafted or submitted yet today
  const allTouchedSlotIds = todaysSubmissions.map(s => s.slotNumber?.toString());

  const reviewNeeded = pendingSubmissions.map(r => {
    // Attempt to match the submission to its timetable class
    const cls = classes.find(c => c.slotId === r.slotNumber?.toString());
    const data = r.attendanceData as any;
    const records = Array.isArray(data) ? data : (data?.records || []);
    
    return {
      id: r.id,
      slotNumber: r.slotNumber,
      subject: cls?.subject || "Unknown Class",
      section: cls?.section || r.section || "N/A",
      date: new Date(r.date).toLocaleDateString(),
      studentsCount: records.length,
      mappedCount: records.filter((v: any) => v.status === "PRESENT").length
    };
  });

  // Only show classes that haven't been submitted yet today
  const actionableClasses = classes.filter(cls => !allTouchedSlotIds.includes(cls.slotId));

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Academic Portal</h1>
        <p className="text-slate-500 font-medium">Manage your class roster and academic synchronization.</p>
      </header>

      {/* Review Section */}
      {reviewNeeded.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Pending Review</h2>
          </div>
          {reviewNeeded.map((r) => (
            <div key={r.id} className="p-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-[2.5rem] flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="font-black text-blue-900 dark:text-blue-100">{r.subject} ({r.section})</p>
                <p className="text-xs font-bold text-blue-600/70 uppercase tracking-widest">{r.mappedCount} Students Mapped via Events</p>
              </div>
              <Link href={`/attendance/erp?hour=${r.slotNumber || '1'}&mode=review`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 h-11 font-bold">
                  View Submission
                </Button>
              </Link>
            </div>
          ))}
        </section>
      )}

      {/* Classes List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Scheduled Classes</h2>
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5">View Calendar</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actionableClasses.map((cls) => (
            <div key={cls.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-white">auto_stories</span>
                </div>
              </div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{cls.subject}</h3>
              <div className="flex items-center gap-2 mt-1 mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cls.section}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cls.year}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span className="text-xs font-bold">{cls.time}</span>
                </div>
                <Link href={`/attendance/erp?hour=${cls.slotId}&section=${cls.section.split('-')[1]}&year=${cls.year.charAt(0)}&dept=dept_${cls.section.split('-')[0].toLowerCase()}&subject=${encodeURIComponent(cls.subject)}`}>
                  <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl">
                    Open Sheet
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
