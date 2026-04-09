import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROLE_CONFIGS } from "@/lib/config/roles";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCards } from "@/components/dashboard/MetricCards";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList
  });

  if (!session) {
    redirect("/login");
  }

  const freshUser = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id)
  });

  if (!freshUser) {
    redirect("/login");
  }

  // Developer Bypass
  const devRole = process.env.NODE_ENV === "development" ? headersList.get("x-ems-role") : null;
  const role = devRole || (freshUser as any)?.role || "STUDENT";
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;

  // 1. Fetch Dashboard DB Data
  let metric1Val: string | number = "-";
  let metric2Val: string | number = "-";
  let metric3Val: string | number = "-";
  
  let recentEvents: any[] = [];
  let pendingApprovals: any[] = [];

  if (role === 'STUDENT') {
    const activeEvents = await db.$count(schema.events, eq(schema.events.status, "PUBLISHED"));
    const registered = await db.$count(schema.registrations, eq(schema.registrations.studentId, freshUser.id));
    metric1Val = activeEvents;
    metric3Val = registered;
    metric2Val = "High"; 

    recentEvents = await db.query.events.findMany({
      where: eq(schema.events.status, "PUBLISHED"),
      orderBy: [desc(schema.events.createdAt)],
      limit: 3
    });
  } 
  else if (role === 'STUDENT_COORDINATOR' || role === 'FACULTY') {
    const myEvents = await db.query.events.findMany({
      where: eq(schema.events.createdBy, freshUser.id),
      orderBy: [desc(schema.events.createdAt)],
      limit: 3
    });
    recentEvents = myEvents;
    metric1Val = myEvents.length;

    if (role === 'FACULTY') {
      const pending = await db.query.eventApprovals.findMany({
        where: and(eq(schema.eventApprovals.approverRole, "FACULTY"), eq(schema.eventApprovals.status, "PENDING_APPROVAL")),
        with: { event: true },
        limit: 3
      });
      pendingApprovals = pending;
      metric2Val = pending.length;
    }
  }
  else if (['PROGRAM_HEAD', 'HOD', 'LEAD_SE', 'AO'].includes(role)) {
    const pending = await db.query.eventApprovals.findMany({
      where: and(eq(schema.eventApprovals.approverRole, role as any), eq(schema.eventApprovals.status, "PENDING_APPROVAL")),
      with: { event: true },
      limit: 5
    });
    pendingApprovals = pending;
    metric1Val = pending.length;
  }
  else if (role === 'ADMIN') {
    const totalUsers = await db.$count(schema.user);
    metric1Val = totalUsers;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <DashboardHeader 
        role={role} 
        userName={freshUser.name} 
        config={config} 
      />

      <MetricCards 
        config={config} 
        metrics={[metric1Val, metric2Val, metric3Val]} 
      />

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {config.actions.map((act, i) => (
          <Link 
            key={act.key}
            href={act.href}
            className={cn(
              "group relative overflow-hidden flex items-center gap-4 p-5 rounded-[2rem] border transition-all duration-300 shadow-sm hover:shadow-md",
              i === 0 ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
              i === 0 ? "bg-white/20 dark:bg-black/10" : config.theme.accent,
              i !== 0 && "text-white"
            )}>
              <span className="material-symbols-outlined">{act.icon}</span>
            </div>
            <span className="font-bold tracking-tight text-sm">{act.label}</span>
            <span className="material-symbols-outlined ml-auto text-xl transition-all duration-300 group-hover:translate-x-1 opacity-60">east</span>
          </Link>
        ))}
      </section>

      {/* Dashboard Split Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Col: Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {['PROGRAM_HEAD', 'HOD', 'LEAD_SE', 'AO'].includes(role) ? "Pending Approvals" : "Recent Events"}
            </h3>
            <Link href="#" className={cn("font-black text-[10px] uppercase tracking-widest hover:underline", config.theme.text)}>View All</Link>
          </div>
          
          <div className="space-y-4">
            {['PROGRAM_HEAD', 'HOD', 'LEAD_SE', 'AO', 'FACULTY'].includes(role) && pendingApprovals.length > 0 ? (
               pendingApprovals.map((approval) => (
                <div key={approval.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-[2rem] flex items-center gap-5 group hover:border-slate-300 transition-all">
                   <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", config.theme.accent, "text-white")}>
                      <span className="material-symbols-outlined text-3xl">verified</span>
                   </div>
                   <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">{approval.event?.title || 'Unknown Event'}</h4>
                      <p className="text-xs font-semibold text-slate-400 truncate">Requires your Authorization</p>
                   </div>
                   <Link href={`/approvals/${approval.id}`} className={cn("p-3 rounded-xl transition-colors shrink-0", config.theme.accent, "text-white")}>
                      <span className="material-symbols-outlined">chevron_right</span>
                   </Link>
                </div>
              ))
            ) : recentEvents.length > 0 ? (
               recentEvents.map((event) => (
                <div key={event.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-5 rounded-[2rem] flex items-center gap-5 group hover:border-slate-300 transition-all">
                   <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shrink-0", config.theme.accent, "text-white")}>
                      {event.coverImage ? (
                        <img src={event.coverImage} className="w-full h-full object-cover" alt="Event Cover" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl">event</span>
                      )}
                   </div>
                   <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate pb-1">{event.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {event.status}
                      </span>
                   </div>
                   <Link href={`/events/${event.id}`} className={cn("p-3 rounded-xl transition-colors shrink-0", config.theme.accent, "text-white")}>
                      <span className="material-symbols-outlined">chevron_right</span>
                   </Link>
                </div>
              ))
            ) : (
               <div className="p-10 text-center bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/10">
                 <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                 <p className="text-slate-500 font-medium">No actions pending right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Calendar Preview */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Calendar Preview</h3>
          </div>
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-4 shadow-sm">
             <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl mb-4">
                <span className="font-bold text-slate-700 dark:text-slate-300">Today</span>
                <span className="text-slate-400 material-symbols-outlined">event_upcoming</span>
             </div>
             
             <div className="space-y-3">
               <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400">10:00</span>
                    <span className="text-xs font-bold text-slate-400">AM</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Design Team Sync</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">Venue: CR 4</p>
                  </div>
               </div>
               <div className="flex gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 transition">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-black text-emerald-600">01:30</span>
                    <span className="text-xs font-black text-emerald-600">PM</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Tech Workshop Main</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">Open Air Theatre</p>
                  </div>
               </div>
             </div>
             <button className="w-full mt-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-900 transition">SEE FULL CALENDAR</button>
          </div>
        </div>

      </div>
    </div>
  );
}
