import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const notifications = await db.query.notifications.findMany({
    where: eq(schema.notifications.userId, session.user.id),
    orderBy: [desc(schema.notifications.createdAt)]
  });

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Grid */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest">Digital Ledger</span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">Live Sync</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">Live Alerts</h1>
          <p className="text-slate-500 font-medium max-w-sm">Centralized institutional feed for event approvals, attendance verification, and system updates.</p>
        </div>
        
        <Link href="/profile" className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
          Back to Profile
        </Link>
      </section>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto space-y-4 px-4">
        {notifications.length === 0 ? (
          <div className="py-24 bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-[3.5rem] flex flex-col items-center text-center">
             <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mb-6">
                <span className="material-symbols-outlined text-4xl">notifications_off</span>
             </div>
             <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Ledger Empty</h3>
             <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2">New institutional alerts will appear here</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="group relative bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-emerald-500">
               <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                     <span className="material-symbols-outlined">{notif.title.includes('Welcome') ? 'waving_hand' : 'campaign'}</span>
                  </div>
                  <div className="flex-grow space-y-1">
                     <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Institutional Alert</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(notif.createdAt, "PPP")}</p>
                     </div>
                     <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight pt-1">{notif.title}</h4>
                     <p className="text-sm font-medium text-slate-500 pt-2 leading-relaxed">{notif.message}</p>
                  </div>
               </div>
               
               {/* Read/Unread State */}
               {!notif.isRead && (
                 <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
               )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
