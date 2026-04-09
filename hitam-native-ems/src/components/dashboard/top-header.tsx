"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function TopHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-primary/10 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white">school</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
              HITAM <span className="text-primary">EMS</span>
            </h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">
              Dashboard
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-11 h-11 glass rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary transition-all"
          >
            {mounted && theme === "dark" ? (
              <span className="material-symbols-outlined">light_mode</span>
            ) : (
              <span className="material-symbols-outlined">dark_mode</span>
            )}
          </button>
          
          <button className="w-11 h-11 glass rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
