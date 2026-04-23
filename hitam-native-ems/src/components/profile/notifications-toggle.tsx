"use client";

import { useState } from "react";
import { toggleNotificationsAction } from "@/lib/actions/user";
import { cn } from "@/lib/utils";

interface NotificationsToggleProps {
  userId: string;
  initialEnabled: boolean;
}

export function NotificationsToggle({ userId, initialEnabled }: NotificationsToggleProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    if (isPending) return;
    const newState = !isEnabled;
    setIsEnabled(newState);
    setIsPending(true);
    
    try {
      const result = await toggleNotificationsAction(userId, newState);
      if (!result.success) {
        setIsEnabled(!newState); // Revert
      }
    } catch (error) {
      console.error(error);
      setIsEnabled(!newState); // Revert
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "w-14 h-7 rounded-full transition-colors relative flex items-center px-1",
        isEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10",
        isPending && "opacity-50 cursor-wait"
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded-full bg-white shadow-xl transition-transform duration-300 transform",
        isEnabled ? "translate-x-7" : "translate-x-0"
      )} />
    </button>
  );
}
