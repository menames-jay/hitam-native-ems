import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cn } from "@/lib/utils";
import { ROLE_CONFIGS } from "@/lib/config/roles";

export default async function CalendarPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) redirect("/login");

  const freshUser = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id)
  });

  // Developer Bypass
  const devRole = process.env.NODE_ENV === "development" ? headersList.get("x-ems-role") : null;
  const role = devRole || (freshUser as any)?.role || "STUDENT";
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;

  // Mocking calendar events for institutional preview
  const events = [
    { title: "Technical Workshop", time: "10:00 AM", category: "Technical", color: "bg-emerald-500" },
    { title: "Club Coordination Meet", time: "02:00 PM", category: "Meeting", color: "bg-blue-500" },
    { title: "Affinity Hour: Open Mic", time: "04:30 PM", category: "Cultural", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Calendar Header */}
      <section className="px-2">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 italic">Campus Schedule</h1>
        <p className="text-slate-500 font-medium max-w-lg">Institutional timeline for events, venue allocations, and academic cycles.</p>
      </section>

      {/* Date Navigator Mockup */}
      <div className="flex items-center justify-between bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm">
         <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 font-black hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
               <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">April 2026</h2>
            <button className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 font-black hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
               <span className="material-symbols-outlined">chevron_right</span>
            </button>
         </div>
         <div className="hidden md:flex gap-2">
            {['Day', 'Week', 'Month'].map((v, i) => (
              <button key={v} className={cn(
                "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                i === 2 ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
              )}>
                {v}
              </button>
            ))}
         </div>
      </div>

      {/* Main Calendar View Mockup (Month Grid) */}
      <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-xl">
         <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
         </div>
         <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-white/5">
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className={cn(
                "h-32 md:h-40 p-4 transition-colors group hover:bg-slate-50 dark:hover:bg-white/10",
                (i + 1 === 3) && "bg-emerald-50/50 dark:bg-emerald-950/20"
              )}>
                <span className={cn(
                  "text-xs font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors",
                  (i + 1 === 3) && "text-emerald-600 font-black"
                )}>
                  {i + 1}
                </span>
                
                {/* Event Blobs */}
                {i + 1 === 3 && (
                  <div className="mt-2 space-y-1.5">
                    {events.map((ev, idx) => (
                      <div key={idx} className={cn("px-2 py-1 rounded-md text-[9px] font-black text-white truncate shadow-sm", ev.color)}>
                        {ev.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}
