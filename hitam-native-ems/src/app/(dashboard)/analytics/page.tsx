import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDepartmentMetricsAction } from "@/lib/actions/analytics";
import { cn } from "@/lib/utils";

const ROLE_THEMES: Record<string, { accent: string; text: string; bg: string }> = {
  STUDENT: { accent: "bg-[#2E7D32]", text: "text-[#2E7D32]", bg: "bg-[#2E7D32]/5" },
  STUDENT_COORDINATOR: { accent: "bg-[#10b981]", text: "text-[#10b981]", bg: "bg-[#10b981]/5" },
  FACULTY: { accent: "bg-[#2b6cee]", text: "text-[#2b6cee]", bg: "bg-[#2b6cee]/5" },
  PROGRAM_HEAD: { accent: "bg-[#6366f1]", text: "text-[#6366f1]", bg: "bg-[#6366f1]/5" },
  HOD: { accent: "bg-[#1e3a8a]", text: "text-[#1e3a8a]", bg: "bg-[#1e3a8a]/5" },
  LEAD_SE: { accent: "bg-[#f59e0b]", text: "text-[#f59e0b]", bg: "bg-[#f59e0b]/5" },
  AO: { accent: "bg-[#8b5cf6]", text: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/5" },
  ADMIN: { accent: "bg-[#0f172a]", text: "text-[#0f172a]", bg: "bg-[#0f172a]/5" },
};

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;
  const role = user.role || "STUDENT";
  const theme = ROLE_THEMES[role] || ROLE_THEMES.STUDENT;

  const res = await getDepartmentMetricsAction(session.user.id);
  const data = res.success ? res.data : null;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-4 md:px-0">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Analytics</h1>
          <p className={cn("text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] opacity-60", theme.text)}>
             Institutional Hub • Dept: {data?.departmentName || "General"}
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
        <StatCard 
          label="Total Events" 
          value={data?.totalEvents || 0} 
          icon="event" 
          theme={theme}
          description="Institutional proposed/led events"
        />
        <StatCard 
          label="Active Registrations" 
          value={data?.totalRegistrations || 0} 
          icon="group" 
          theme={theme}
          description="Total student enrollments"
        />
        <StatCard 
          label="Total Revenue" 
          value={`₹${(data?.totalRevenue || 0).toLocaleString()}`} 
          icon="payments" 
          theme={theme}
          description="Net collections from paid events"
        />
        <StatCard 
          label="Published Leads" 
          value={data?.activeEvents || 0} 
          icon="rocket_launch" 
          theme={theme}
          description="Live events currently on portal"
        />
      </div>

      {/* Placeholder Details Section */}
      <div className="bg-white dark:bg-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl", theme.accent)} />
        
        <div className="relative space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Engagement</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Daily registration volume across the department.
                </p>
              </div>
              <div className="flex gap-2">
                 <button className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95", theme.accent)}>
                    Download Report
                 </button>
              </div>
           </div>

           {/* Simple Data Table (Placeholder for actual chart) */}
           <div className="bg-slate-50 dark:bg-[#0a0f0a]/50 rounded-[2rem] p-6 text-center border border-slate-100 dark:border-white/5">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-2">monitoring</span>
              <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                 Live chart modules for registration trends are coming in v1.1
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, description, theme }: { label: string, value: any, icon: string, description: string, theme: any }) {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
      <div className={cn("absolute bottom-0 right-0 w-24 h-24 rounded-full -mb-12 -mr-12 opacity-5 blur-2xl group-hover:opacity-10 transition-opacity", theme.accent)} />
      
      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg", theme.accent)}>
            <span className="material-symbols-outlined text-white text-[24px]">{icon}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{label}</h4>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{value}</p>
        </div>

        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
