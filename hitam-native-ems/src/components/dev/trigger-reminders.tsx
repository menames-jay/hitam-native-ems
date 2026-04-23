"use client";

import { useState } from "react";
import { triggerRemindersAction } from "@/lib/actions/dev";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TriggerRemindersButton() {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");

  const handleTrigger = async () => {
    setIsPending(true);
    try {
      await triggerRemindersAction();
      setStatus("SUCCESS");
      setTimeout(() => setStatus("IDLE"), 3000);
    } catch (error) {
      console.error(error);
      setStatus("ERROR");
      setTimeout(() => setStatus("IDLE"), 3000);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button 
      onClick={handleTrigger}
      disabled={isPending}
      className="w-full flex items-center justify-between p-8 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors group text-left"
    >
      <div className="flex items-center gap-5">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all shadow-sm",
          status === "SUCCESS" ? "bg-emerald-500" : status === "ERROR" ? "bg-red-500" : "bg-amber-500"
        )}>
          <span className="material-symbols-outlined text-white">
            {status === "SUCCESS" ? "verified" : status === "ERROR" ? "error" : "bolt"}
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-base font-bold text-slate-900 dark:text-white leading-none">
            {isPending ? "Triggering..." : status === "SUCCESS" ? "Engine Fired!" : "Force Trigger Reminders"}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Manual 24h/1h alert poll
          </p>
        </div>
      </div>
      <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">bolt</span>
    </button>
  );
}
