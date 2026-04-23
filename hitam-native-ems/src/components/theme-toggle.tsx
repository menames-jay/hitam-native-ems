"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-11 h-11 grid place-items-center text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-all duration-300 active:scale-95 group"
      title="Toggle Theme"
    >
      <div className="grid grid-cols-1 grid-rows-1 place-items-center">
        <Sun className="col-start-1 row-start-1 h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
        <Moon className="col-start-1 row-start-1 h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
