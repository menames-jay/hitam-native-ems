import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function ReportsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  // Mock reporting metrics (to be expanded in Phase 3)
  const metrics = [
    { label: "Total Participations", value: "1,240", growth: "+12%", icon: "groups" },
    { label: "Approved Events", value: "42", growth: "+4", icon: "verified" },
    { label: "Venue Utilization", value: "68%", growth: "-2%", icon: "meeting_room" },
    { label: "Engagement Index", value: "8.4", growth: "+0.3", icon: "monitoring" },
  ];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="px-2">
         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 block">Institutional Insights</span>
         <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-none italic uppercase">
           Reports
         </h1>
         <p className="text-slate-500 font-medium max-w-lg">Advanced analytics and historical participation data for department and institute levels.</p>
      </header>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-8">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  <span className="material-symbols-outlined">{m.icon}</span>
               </div>
               <span className={cn(
                 "text-[10px] font-black px-2 py-0.5 rounded-full",
                 m.growth.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
               )}>
                 {m.growth}
               </span>
            </div>
            <div>
               <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{m.value}</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Analytics Charts */}
      <section className="bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[4rem] p-20 flex flex-col items-center justify-center min-h-[400px]">
         <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-slate-300 text-4xl animate-pulse">analytics</span>
         </div>
         <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm text-center">
           Detailed Graphical Analytics <br/>
           <span className="opacity-50 text-[10px]">Processing Phase 3 Data Models...</span>
         </p>
      </section>
    </div>
  );
}
