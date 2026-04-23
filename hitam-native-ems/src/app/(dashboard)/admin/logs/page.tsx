import { getServerSession } from "@/lib/auth/role";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function AdminLogsPage() {
  const session = await getServerSession();

  // ONLY ADMINS can see this page
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  // Fetch combined history for institutional audit
  const approvalHistory = await db.query.eventApprovals.findMany({
    with: { event: true, approver: true },
    orderBy: [desc(schema.eventApprovals.updatedAt)],
    limit: 20
  });

  const systemLogs = await db.query.auditLogs.findMany({
    with: { user: true },
    orderBy: [desc(schema.auditLogs.createdAt)],
    limit: 20
  });

  // Merge and sort
  const allLogs = [
    ...approvalHistory.map(l => ({ 
      id: l.id, 
      type: 'APPROVAL', 
      title: l.event?.title || 'System Action',
      date: l.updatedAt,
      message: `${l.approverRole} ${l.status === 'APPROVED' ? 'authorized' : 'rejected'} this event.`,
      user: l.approvedBy,
      status: l.status
    })),
    ...systemLogs.map(l => ({
      id: l.id,
      type: 'SYSTEM',
      title: l.action.replace(/_/g, ' '),
      date: l.createdAt,
      message: JSON.stringify(l.details),
      user: l.user?.name || l.userId,
      status: 'NEUTRAL'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      
      {/* Header */}
      <header className="px-2">
         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 block">Institutional Integrity</span>
         <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-none">
           Audit Logs
         </h1>
         <p className="text-slate-500 font-medium max-w-lg">Complete history of administrative actions, approval chains, and governance decisions across the EMS platform.</p>
      </header>

      {/* Timeline View */}
      <section className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white px-2 uppercase tracking-tight">Recent Governance Actions</h3>
        
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-white/5 before:to-transparent">
          
          {allLogs.map((log, idx) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Dot */}
              <div className={cn(
                 "flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-50 dark:bg-white/5 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500",
                 log.type === 'APPROVAL' ? "group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500" : "group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500"
              )}>
                 <span className="material-symbols-outlined text-sm">{log.type === 'APPROVAL' ? (log.status === 'APPROVED' ? 'verified' : 'block') : 'settings_suggest'}</span>
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-slate-100 dark:group-hover:shadow-none group-hover:-translate-y-1">
                <div className="flex items-center justify-between space-x-2 mb-2">
                  <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg italic">
                    {log.title}
                  </div>
                  <time className="font-black text-[10px] text-emerald-600 uppercase tracking-widest whitespace-nowrap">
                    {new Date(log.date).toLocaleDateString()}
                  </time>
                </div>
                <div className="text-slate-500 font-medium text-sm mb-4 line-clamp-2">
                   {log.message}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{log.type === 'APPROVAL' ? 'Decision By:' : 'Actor:'}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white truncate">{log.user}</span>
                </div>
              </div>
            </div>
          ))}

          {allLogs.length === 0 && (
             <div className="text-center py-20 bg-slate-50/50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No governance logs recorded yet.</p>
             </div>
          )}
        </div>
      </section>

    </div>
  );
}
