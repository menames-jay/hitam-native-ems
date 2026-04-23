"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { ROLE_CONFIGS } from "@/lib/config/roles";

export function BottomNavbar({ role }: { role: string }) {
  const pathname = usePathname();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;
  const { theme, navigation: slots } = config;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md md:hidden">
      <nav className="bg-white/95 dark:bg-[#0a0f0a]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 px-4 py-3 rounded-[2.5rem] shadow-2xl shadow-black/25">
        <div className="grid grid-cols-5 items-center justify-items-center">
          {slots.map((slot) => {
            const isActive = pathname === slot.href;
            
            if (slot.isHero) {
              return (
                <Link 
                  key={slot.href} 
                  href={slot.href}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center -translate-y-6 shadow-xl transition-all duration-300",
                    theme.accent,
                    "text-white border-[6px] border-white dark:border-[#0a0f0a] active:scale-95",
                    isActive && "ring-4 ring-emerald-500/20"
                  )}
                >
                  <span className="material-symbols-outlined text-[28px]">{slot.icon}</span>
                </Link>
              );
            }

            return (
              <Link 
                key={slot.label} 
                href={slot.href}
                className="flex flex-col items-center justify-center gap-1 group relative py-1 w-full"
              >
                <span className={cn(
                  "material-symbols-outlined text-[22px] transition-all duration-300",
                  isActive ? theme.text : "text-slate-400 group-hover:scale-110 group-active:scale-90",
                  isActive && "font-variation-fill"
                )}>
                  {slot.icon}
                </span>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-[0.05em] transition-colors duration-300",
                  isActive ? theme.text : "text-slate-400"
                )}>
                  {slot.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
