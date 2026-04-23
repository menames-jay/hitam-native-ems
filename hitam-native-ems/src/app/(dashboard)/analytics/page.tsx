import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { 
  getDepartmentMetricsAction, 
  getParticipationTrendsAction, 
  getCategoryDistributionAction 
} from "@/lib/actions/analytics";
import { cn } from "@/lib/utils";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { CSVDownloadButton } from "@/components/analytics/CSVDownloadButton";

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
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const role = user.role;
  const theme = ROLE_THEMES[role] || ROLE_THEMES.STUDENT;

  // Parallel data fetching for performance
  const [metricsRes, trendsRes, categoriesRes] = await Promise.all([
    getDepartmentMetricsAction(user.id),
    getParticipationTrendsAction(user.id),
    getCategoryDistributionAction(user.id)
  ]);

  const data = metricsRes.success ? metricsRes.data : null;
  const trends = trendsRes.success ? trendsRes.data : [];
  const categories = categoriesRes.success ? categoriesRes.data : [];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 px-4 md:px-2">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] block">Institutional Hub</span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Analytics</h1>
          <p className={cn("text-xs font-bold uppercase tracking-widest opacity-60", theme.text)}>
             Dept Intelligence • {data?.departmentName || "Institutional General"}
          </p>
        </div>
        <CSVDownloadButton data={trends as any} filename={`HITAM_EMS_Report_${new Date().toISOString().split('T')[0]}.csv`} />
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
          value={`\u20B9${(data?.totalRevenue || 0).toLocaleString()}`} 
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

      {/* Analytics Charts Section */}
      <div className="px-4 md:px-0">
         <AnalyticsCharts trendData={trends as any} categoryData={categories as any} theme={theme} />
      </div>

      <div className="bg-slate-50 dark:bg-white/5 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 text-center space-y-4">
         <span className="material-symbols-outlined text-4xl text-slate-300">verified</span>
         <p className="text-xs font-black text-slate-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            Data aggregates are refreshed every 4 hours. Download the institutional CSV for full row-level participation audits.
         </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, description, theme }: { label: string, value: any, icon: string, description: string, theme: any }) {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] p-10 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
      <div className={cn("absolute bottom-0 right-0 w-24 h-24 rounded-full -mb-12 -mr-12 opacity-5 blur-2xl group-hover:opacity-10 transition-opacity", theme.accent)} />
      
      <div className="relative space-y-6">
        <div className="flex items-center justify-between">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg", theme.accent)}>
            <span className="material-symbols-outlined text-white text-[28px]">{icon}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{label}</h4>
          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none mt-2">{value}</p>
        </div>

        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

