import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCalendarSessionsAction } from "@/lib/actions/calendar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

export default async function CalendarPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const res = await getCalendarSessionsAction();
  const sessions = res.success ? res.sessions : [];

  // Calendar Logic for Current Month
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Calendar Header */}
      <section className="px-2">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 italic uppercase">Campus Schedule</h1>
        <p className="text-slate-500 font-medium max-w-lg">Institutional timeline for events, venue allocations, and academic cycles.</p>
      </section>

      {/* Date Navigator */}
      <div className="flex items-center justify-between bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm">
         <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">{format(today, "MMMM yyyy")}</h2>
         </div>
      </div>

      {/* Main Calendar View (Month Grid) */}
      <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-xl">
         <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
         </div>
         <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-white/5">
            {days.map((day, i) => {
              const daySessions = sessions.filter(s => isSameDay(new Date(s.startTime), day));
              return (
                <div key={i} className={cn(
                  "h-32 md:h-40 p-4 transition-colors group hover:bg-slate-50 dark:hover:bg-white/10",
                  isSameDay(day, today) && "bg-emerald-50/50 dark:bg-emerald-950/20"
                )}>
                  <span className={cn(
                    "text-xs font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors",
                    isSameDay(day, today) && "text-emerald-600 font-bold"
                  )}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="mt-2 space-y-1.5 overflow-y-auto max-h-24 no-scrollbar">
                     {daySessions.map((s, idx) => (
                        <div key={idx} className={cn(
                           "px-2 py-1 rounded-md text-[9px] font-black text-white truncate shadow-sm",
                           s.event.category === 'TECHNICAL' ? "bg-emerald-500" :
                           s.event.category === 'CLUB' ? "bg-blue-500" : "bg-purple-500"
                        )}>
                           {s.event.title}
                        </div>
                     ))}
                  </div>
                </div>
              );
            })}
         </div>
      </div>

    </div>
  );
}
