"use client";

import { useState, useMemo } from "react";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

interface MyEventsTabsProps {
  events: any[];
}

type TabType = "ACTIVE" | "UPCOMING" | "PAST";

export function MyEventsTabs({ events }: MyEventsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ACTIVE");

  const categorized = useMemo(() => {
    const now = new Date();
    
    return events.reduce((acc, event) => {
      const sessions = event.sessions || [];
      
      const isActive = sessions.some((s: any) => {
        const start = new Date(s.startTime);
        const end = new Date(s.endTime);
        return now >= start && now <= end;
      });

      const isPast = sessions.every((s: any) => {
        const end = new Date(s.endTime);
        return now > end;
      });

      if (isActive) {
        acc.ACTIVE.push(event);
      } else if (isPast) {
        acc.PAST.push(event);
      } else {
        acc.UPCOMING.push(event);
      }
      
      return acc;
    }, { ACTIVE: [], UPCOMING: [], PAST: [] } as Record<TabType, any[]>);
  }, [events]);

  const currentEvents = categorized[activeTab];

  return (
    <div className="space-y-8">
      {/* Tabs Selector */}
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 w-fit">
        {(["ACTIVE", "UPCOMING", "PAST"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab 
                ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            {tab} ({categorized[tab].length})
          </button>
        ))}
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 text-center">
             <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">history</span>
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No {activeTab.toLowerCase()} events found</p>
          </div>
        )}
      </div>
    </div>
  );
}
