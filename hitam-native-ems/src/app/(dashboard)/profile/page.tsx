import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { ROLE_CONFIGS } from "@/lib/config/roles";

export default async function ProfilePage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect("/login");
  }

  const freshUser = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
    with: {
      department: true
    }
  });

  // Developer Bypass
  const devRole = process.env.NODE_ENV === "development" ? headersList.get("x-ems-role") : null;
  const role = devRole || freshUser?.role || "STUDENT";
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;

  return (
    <div className="max-w-md mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Premium Profile Header */}
      <div className="relative overflow-hidden rounded-[3.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-10 shadow-2xl">
        <div className={cn("absolute top-0 right-0 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-20 blur-3xl", config.theme.accent)} />
        
        <div className="relative flex flex-col items-center text-center space-y-6">
          <div className={cn("w-28 h-28 rounded-3xl p-1.5 border-4 transition-transform hover:rotate-3", config.theme.accent.replace('bg-', 'border-').replace('[#', '[#'))}>
            <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden shadow-inner">
               {freshUser?.image ? (
                 <img src={freshUser.image} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="material-symbols-outlined text-5xl text-slate-300">person</span>
               )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{freshUser?.name}</h1>
            <p className={cn("text-[10px] font-black uppercase tracking-[0.3em]", config.theme.text)}>
              {role.replace('_', ' ')} • {freshUser?.department?.code || "GENERAL"}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl">
             <span className="material-symbols-outlined text-sm">verified_user</span>
             Institutional Account
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-8">Preferences</h3>
        
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-xl">
          {/* Theme Toggle Item */}
          <div className="flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-slate-500">nights_stay</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-base font-bold text-slate-900 dark:text-white leading-none">Dark Appearance</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional visual theme</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 mx-8" />

          {/* Notifications Placeholder */}
          <div className="flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-slate-500">notifications_active</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-base font-bold text-slate-900 dark:text-white leading-none">Live Alerts</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Event & Status updates</p>
              </div>
            </div>
            <div className="w-14 h-7 rounded-full bg-slate-200 dark:bg-white/10 p-1.5 cursor-not-allowed">
              <div className="w-4 h-4 rounded-full bg-white shadow-md translate-x-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Hub */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-8">Institutional Hub</h3>
        
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-xl">
          <button className="w-full flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group text-left">
            <div className="flex items-center gap-5">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm", config.theme.accent)}>
                <span className="material-symbols-outlined text-white">account_balance</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-base font-bold text-slate-900 dark:text-white leading-none">Departmental Portal</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{freshUser?.department?.name || "General Access"}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">east</span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-white/5 mx-8" />

          {/* Danger Zone: Sign Out */}
          <button className="w-full flex items-center justify-between p-8 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors group text-left">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-rose-500 font-bold">power_settings_new</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-base font-bold text-rose-600 leading-none group-hover:tracking-tight transition-all">Sign Out Portal</p>
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-1">End institutional session</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center py-6">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.5em] italic">HITAM Native / EMS v1</p>
      </div>
    </div>
  );
}
