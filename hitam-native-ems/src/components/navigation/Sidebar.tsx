"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Explore", href: "/explore", icon: "explore", roles: ["STUDENT", "STUDENT_COORDINATOR"] },
  { label: "Workflows", href: "/approvals", icon: "fact_check", roles: ["FACULTY", "HOD", "PROGRAM_HEAD", "ADMIN", "LEAD_SE", "AO"] },
  { label: "Attendance", href: "/attendance", icon: "how_to_reg", roles: ["FACULTY", "STUDENT_COORDINATOR", "PROGRAM_HEAD"] },
  { label: "My Events", href: "/my-events", icon: "event_note" },
  { label: "Analytics", href: "/analytics", icon: "analytics", roles: ["ADMIN", "HOD", "PROGRAM_HEAD", "LEAD_SE"] },
  { label: "Settings", href: "/settings", icon: "settings" },
];

const THEME_MAP: Record<string, { accent: string; text: string }> = {
  STUDENT: { accent: "bg-[#2E7D32]", text: "text-[#2E7D32]" },
  STUDENT_COORDINATOR: { accent: "bg-[#10b981]", text: "text-[#10b981]" },
  FACULTY: { accent: "bg-[#2b6cee]", text: "text-[#2b6cee]" },
  PROGRAM_HEAD: { accent: "bg-[#6366f1]", text: "text-[#6366f1]" },
  HOD: { accent: "bg-[#1e3a8a]", text: "text-[#1e3a8a]" },
  LEAD_SE: { accent: "bg-[#f59e0b]", text: "text-[#f59e0b]" },
  AO: { accent: "bg-[#8b5cf6]", text: "text-[#8b5cf6]" },
  ADMIN: { accent: "bg-[#0f172a]", text: "text-[#0f172a]" },
};

export function Sidebar({ role, user }: { role: string, user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const theme = THEME_MAP[role] || THEME_MAP.STUDENT;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const filteredItems = navItems.filter(item => 
    !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-50 bg-white dark:bg-[#0a0f0a] border-r border-slate-200 dark:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 p-8">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", theme.accent)}>
          <span className="material-symbols-outlined text-white">school</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none italic">HITAM EMS</h1>
          <p className={cn("text-[8px] font-black tracking-[0.2em] uppercase mt-1.5 opacity-80", theme.text)}>
            {role.replace("_", " ")} Portal
          </p>
        </div>
      </div>

      <nav className="flex-grow px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-4 mb-4 mt-2">
          Governance Hub
        </div>
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? `${theme.accent} text-white shadow-xl shadow-black/10` 
                  : `text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:${theme.text}`
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-[24px]",
                isActive && "font-variation-fill"
              )}>
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-4 border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2", pathname.includes('profile') ? theme.accent.replace('bg-', 'border-') : 'border-transparent')}>
               <div className="w-full h-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">person</span>
               </div>
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.name || "User"}</p>
              <p className={cn("text-[9px] font-bold truncate uppercase tracking-widest", theme.text)}>{role}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <ThemeToggle />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-xs font-black uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Exit
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
