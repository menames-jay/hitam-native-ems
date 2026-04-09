"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: string;
  themeColor?: string;
  accentBg?: string;
  role?: string;
}

export function ModulePlaceholder({ 
  title, 
  description, 
  icon, 
  themeColor = "text-slate-900", 
  accentBg = "bg-slate-900",
  role = "Institutional"
}: ModulePlaceholderProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Decorative Icon */}
      <div className="relative">
        <div className={cn("w-32 h-32 rounded-[3rem] rotate-12 flex items-center justify-center shadow-2xl animate-pulse", accentBg)}>
          <span className="material-symbols-outlined text-6xl text-white -rotate-12">{icon}</span>
        </div>
        <div className={cn("absolute -top-4 -right-4 w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-white/10", themeColor)}>
           <span className="material-symbols-outlined text-2xl">pending_actions</span>
        </div>
      </div>

      <div className="max-w-2xl space-y-4">
        <p className={cn("font-black text-[10px] uppercase tracking-[0.4em]", themeColor)}>
          {role} Governance • Module in Development
        </p>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        <p className="text-xl font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          href="/dashboard" 
          className={cn("px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.05] active:scale-95 text-white shadow-xl shadow-slate-200 dark:shadow-none", accentBg)}
        >
          Return to Dashboard
        </Link>
        <button className="px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-2 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
          Report Issue
        </button>
      </div>

      {/* Structural Hint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-10">
         {[1, 2, 3].map((i) => (
           <div key={i} className="h-32 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex items-center justify-center p-6 bg-slate-50/50 dark:bg-white/5">
              <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full" />
           </div>
         ))}
      </div>
    </div>
  );
}
