import { getServerSession } from "@/lib/auth/role";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ApprovalCard } from "@/components/approvals/approval-card";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const session = await getServerSession();

  if (!session) redirect("/login");

  const freshUser = session.user;
  const role = freshUser.role;
  const normalizedRole = role.trim().toUpperCase();

  // Fetch role-specific approvals
  const approvals = await db.query.eventApprovals.findMany({
    where: and(
      eq(schema.eventApprovals.approverRole, normalizedRole as any),
      eq(schema.eventApprovals.status, "PENDING_APPROVAL")
    ),
    with: {
      event: {
        with: { creator: true }
      }
    }
  });

  const venues = await db.query.venues.findMany();

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <section className="px-2">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase">
          Institutional Approvals
        </h1>
        <p className="text-slate-500 font-medium max-w-lg">
          Review and authorize pending event proposals, venue allocations, and attendance records within your jurisdiction.
        </p>
      </section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 dark:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <span className="material-symbols-outlined text-9xl">verified</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Pending Requests</span>
            <h2 className="text-6xl font-black mt-2 tracking-tighter">{approvals.length}</h2>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Immediate Action Required</span>
            </div>
         </div>
         <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional SLA</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Active Compliance</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">Average response window: 24h</p>
            <div className="mt-8 h-1 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
               <div className="h-full w-3/4 bg-emerald-600 rounded-full" />
            </div>
         </div>
      </div>

      {/* Main Approval List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Awaiting Decision
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-full">
            Filtered by my role
          </span>
        </div>
        
        {approvals.length > 0 ? (
          <div className="space-y-4">
            {approvals.map((app) => (
              <ApprovalCard 
                key={app.id} 
                approval={app} 
                userId={freshUser.id}
                role={role}
                venues={venues}
              />
            ))}
          </div>
        ) : (
          <div className="p-24 text-center bg-slate-50/50 dark:bg-white/5 rounded-[4rem] border border-dashed border-slate-200 dark:border-white/10 group">
             <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-5xl text-emerald-600 italic">verified</span>
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Your queue is clear!</h3>
             <p className="text-slate-400 font-bold mt-3 max-w-xs mx-auto text-sm">All institutional actions have been processed within your jurisdiction.</p>
          </div>
        )}
      </div>

    </div>
  );
}
