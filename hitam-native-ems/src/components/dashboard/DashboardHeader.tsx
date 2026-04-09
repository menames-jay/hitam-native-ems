import { cn } from "@/lib/utils";
import { RoleConfig } from "@/lib/config/roles";

interface DashboardHeaderProps {
  role: string;
  userName: string;
  config: RoleConfig;
}

export function DashboardHeader({ role, userName, config }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
      <div className="space-y-1 relative z-10">
        <p className={cn("font-black text-[10px] uppercase tracking-[0.2em] ml-1", `text-${config.theme.colorName}-500`)}>
          {role.replace('_', ' ')} Dashboard
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Hi, {(userName || "User").split(" ")[0]}!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
          Here is your dynamic overview for the current academic session.
        </p>
      </div>
      
      {/* Context Card */}
      <div className="flex items-center gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-3xl shadow-sm z-10">
         <div className="text-right">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Status</p>
           <p className="text-sm font-black text-slate-900 dark:text-white">Active</p>
         </div>
         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", config.theme.accent, "text-white")}>
            <span className="material-symbols-outlined">{config.icons.header}</span>
         </div>
      </div>
    </header>
  );
}
