"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { setDevRoleAction } from "@/lib/actions/dev";
import { useRouter } from "next/navigation";

const ROLES = [
  { id: "STUDENT", label: "Student", color: "bg-[#2E7D32]" },
  { id: "STUDENT_COORDINATOR", label: "Coordinator", color: "bg-[#10b981]" },
  { id: "FACULTY", label: "Faculty", color: "bg-[#2b6cee]" },
  { id: "PROGRAM_HEAD", label: "Program Head", color: "bg-[#6366f1]" },
  { id: "HOD", label: "HOD", color: "bg-[#1e3a8a]" },
  { id: "LEAD_SE", label: "Lead SE", color: "bg-[#f59e0b]" },
  { id: "AO", label: "Admin Officer", color: "bg-[#8b5cf6]" },
  { id: "ADMIN", label: "Super Admin", color: "bg-[#0f172a]" },
];

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleRoleSwitch = async (newRole: string) => {
    if (newRole === currentRole || isPending) return;
    
    setIsPending(true);
    const res = await setDevRoleAction(newRole);
    
    if (res.success) {
      // Small delay to show transition
      setTimeout(() => {
        setIsPending(false);
        router.push("/dashboard");
        router.refresh(); // Crucial for layout fresh-fetch
      }, 300);
    } else {
      alert("Failed to switch role");
      setIsPending(false);
    }
  };

  return (
    <div className="fixed top-6 left-6 z-[110] flex flex-col items-start gap-3 group">
      {/* Role Menu */}
      <div className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-3 shadow-2xl transition-all duration-300 transform origin-top-left",
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 -translate-y-10 pointer-events-none"
      )}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Dev: Institutional Roles</p>
        <div className="grid grid-cols-2 gap-2 min-w-[300px]">
          {ROLES.map((role) => (
            <button
              key={role.id}
              disabled={isPending}
              onClick={() => handleRoleSwitch(role.id)}
              className={cn(
                "flex items-center gap-2 p-1.5 rounded-xl transition-all text-left group/item",
                currentRole === role.id 
                  ? "bg-slate-100 dark:bg-white/10" 
                  : "hover:bg-slate-50 dark:hover:bg-white/5"
              )}
            >
              <div className={cn("w-2.5 h-2.5 rounded-full shrink-0 group-hover/item:scale-125 transition-transform", role.color)} />
              <span className={cn(
                "text-[10px] font-bold leading-none truncate",
                currentRole === role.id ? "text-slate-900 dark:text-white" : "text-slate-500"
              )}>
                {role.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 active:scale-95 group opacity-40 hover:opacity-100",
          isPending ? "bg-slate-400 animate-pulse cursor-wait" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
        )}
      >
        <span className={cn(
          "material-symbols-outlined text-lg transition-transform",
          isOpen && "rotate-45"
        )}>
          {isPending ? "sync_lock" : "settings_accessibility"}
        </span>
      </button>
    </div>
  );
}
