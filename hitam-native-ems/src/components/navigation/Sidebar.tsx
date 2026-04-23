"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ROLE_CONFIGS } from "@/lib/config/roles";

export function Sidebar({ role, user }: { role: string, user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;
  const { theme, navigation: slots } = config;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  // Enforce 4-link constraint as per institutional policy
  const displaySlots = slots.filter(s => !s.isHero).slice(0, 4);

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-50 bg-white dark:bg-[#0a0f0a] border-r border-slate-200 dark:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 p-8">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12 duration-500", theme.accent)}>
          <span className="material-symbols-outlined text-white">school</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none italic">HITAM EMS</h1>
          <p className={cn("text-[8px] font-black tracking-[0.2em] uppercase mt-1.5 opacity-80", theme.text)}>
            {role.replace("_", " ")} Portal
          </p>
        </div>
      </div>

      <nav className="flex-grow px-4 space-y-2 overflow-y-auto pt-4">
        <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.4em] px-4 mb-6">
          Institutional Core
        </div>
        {displaySlots.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative",
                isActive 
                  ? `${theme.accent} text-white shadow-2xl shadow-black/10 dark:shadow-none scale-[1.02] -translate-y-0.5` 
                  : `text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:${theme.text}`
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-[24px] transition-all duration-500",
                isActive ? "font-variation-fill scale-110" : "group-hover:scale-110"
              )}>
                {item.icon}
              </span>
              <span className={cn(
                "font-black text-xs tracking-widest uppercase transition-all duration-300",
                isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 dark:bg-white/5 rounded-[2.5rem] p-5 border border-slate-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/profile" className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-300",
              pathname.startsWith('/profile') ? `${theme.accent.replace('bg-', 'border-')} scale-110 shadow-lg` : 'border-transparent hover:border-slate-200'
            )}>
               <div className="w-full h-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">person</span>
               </div>
            </Link>
            <div className="flex-grow min-w-0">
              <p className="text-[13px] font-black text-slate-900 dark:text-white truncate tracking-tight">{user?.name || "User"}</p>
              <p className={cn("text-[8px] font-black truncate uppercase tracking-[0.15em] opacity-60", theme.text)}>{role}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-200/50 dark:border-white/5">
            <ThemeToggle />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-[10px] font-black uppercase tracking-widest group shadow-sm hover:shadow-red-100 dark:hover:shadow-none"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">logout</span>
              Exit
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
