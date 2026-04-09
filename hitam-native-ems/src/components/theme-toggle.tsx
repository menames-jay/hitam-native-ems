"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-primary/5 transition-all">
        <span className="material-symbols-outlined text-[22px]">dark_mode</span>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-white/5 hover:text-primary transition-all" 
      title="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <span className="material-symbols-outlined text-[22px]">light_mode</span>
      ) : (
        <span className="material-symbols-outlined text-[22px]">dark_mode</span>
      )}
    </button>
  );
}
