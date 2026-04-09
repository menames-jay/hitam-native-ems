import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ApprovalsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList
  });

  if (!session) redirect("/login");

  const freshUser = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id)
  });

  if (!freshUser) redirect("/login");

  // Developer Bypass
  const cookieStore = await (await import('next/headers')).cookies();
  const cookieRole = cookieStore.get("ems-role")?.value;
  const devRole = process.env.NODE_ENV === "development" ? (headersList.get("x-ems-role") || cookieRole) : null;
  const role = devRole || freshUser.role || "STUDENT";

  // Fetch role-specific approvals
  const approvals = await db.query.eventApprovals.findMany({
    where: and(
      eq(schema.eventApprovals.approverRole, role as any),
      eq(schema.eventApprovals.status, "PENDING_APPROVAL")
    ),
    with: {
      event: true
    },
    orderBy: [desc(schema.eventApprovals.createdAt)]
  });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <section className="px-2">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Institutional Approvals</h1>
        <p className="text-slate-500 font-medium max-w-lg">Review and authorize pending event proposals, venue allocations, and attendance records within your jurisdiction.</p>
      </section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 dark:shadow-none">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Pending Requests</span>
            <h2 className="text-5xl font-black mt-2">{approvals.length}</h2>
         </div>
         <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SLA Status</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">On Track</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">Average response time: 4.2h</p>
         </div>
      </div>

      {/* Main Approval List */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white px-2">Awaiting Decision</h3>
        
        {approvals.length > 0 ? (
          <div className="space-y-4">
            {approvals.map((app) => (
              <div key={app.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[3rem] shadow-sm group hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                         <span className="material-symbols-outlined text-3xl">task</span>
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-lg font-black text-slate-900 dark:text-white">{app.event?.title || 'Unknown Event'}</h4>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submitted By: {app.event?.createdBy || 'System'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="flex-1 md:flex-none px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs rounded-xl hover:scale-105 transition-all">
                        VIEW DETAILS
                      </button>
                      <button className="flex-1 md:flex-none px-8 py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:scale-105 transition-all">
                        APPROVE
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center bg-slate-50 dark:bg-white/5 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-white/10">
             <span className="material-symbols-outlined text-6xl text-slate-200 mb-6 italic">verified</span>
             <h3 className="text-xl font-black text-slate-900 dark:text-white">Your queue is clear!</h3>
             <p className="text-slate-400 font-medium mt-2">All institutional actions have been processed.</p>
          </div>
        )}
      </div>

    </div>
  );
}
