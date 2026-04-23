import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns"

export default async function AttendanceHistoryPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== "STUDENT") redirect("/dashboard");

  const records = await db.query.attendanceRecords.findMany({
    where: eq(schema.attendanceRecords.studentId, session.user.id),
    with: {
      eventSession: {
        with: {
          event: true,
          venue: true
        }
      }
    },
    orderBy: [desc(schema.attendanceRecords.scannedAt)]
  });

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Premium Header */}
      <section className="bg-slate-900 dark:bg-emerald-950/20 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <span className="material-symbols-outlined text-[10rem] text-white">timeline</span>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">Official Record</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic">Participation Timeline</h1>
          <p className="text-emerald-100/60 font-medium max-w-sm text-sm">A verified audit log of your institutional engagement and extra-curricular credit.</p>
        </div>
      </section>

      {/* Timeline View */}
      <div className="max-w-4xl mx-auto space-y-8 relative">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-100 dark:bg-white/5 rounded-full" />

        {records.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">history_toggle_off</span>
            <h3 className="text-xl font-black text-slate-400">No Records Found</h3>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Start attending events to build your timeline</p>
          </div>
        ) : (
          records.map((record, idx) => (
            <div key={record.id} className="relative pl-24 group">
              {/* Timeline Dot */}
              <div className="absolute left-[29px] top-6 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 group-hover:scale-150 transition-transform z-10 shadow-lg shadow-emerald-500/20" />

              <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:translate-x-2 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{format(record.scannedAt, "PPPP")}</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      {record.eventSession?.event.title}
                    </h3>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {record.eventSession?.venue?.name || "Main Grounds"}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-widest">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {format(record.scannedAt, "p")}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-5 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl">verified</span>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">Verification</p>
                        <p className="text-xs font-black">Success</p>
                      </div>
                    </div>
                    <p className="text-[8px] font-black text-slate-300 dark:text-white/20 uppercase tracking-[0.3em]">ID: {record.id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
