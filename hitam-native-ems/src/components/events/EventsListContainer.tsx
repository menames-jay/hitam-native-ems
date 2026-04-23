"use client";

import { useState } from "react";
import { EventCard } from "./EventCard";
import { CalendarView } from "./CalendarView";
import { cn } from "@/lib/utils";

interface EventsListContainerProps {
  initialEvents: any[];
}

export function EventsListContainer({ initialEvents }: EventsListContainerProps) {
  const [view, setView] = useState<"GRID" | "CALENDAR">("GRID");

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="flex items-center justify-between px-2">
         <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
            <button 
              onClick={() => setView("GRID")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300",
                view === "GRID" ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Grid View</span>
            </button>
            <button 
              onClick={() => setView("CALENDAR")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300",
                view === "CALENDAR" ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Calendar</span>
            </button>
         </div>

         <div className="hidden md:flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-sm">info</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">Showing {initialEvents.length} Active Events</p>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[600px] transition-all duration-500">
        {view === "GRID" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-1">
            {initialEvents.length > 0 ? (
              initialEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                 <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching events found</p>
              </div>
            )}
          </div>
        ) : (
          <CalendarView events={initialEvents} />
        )}
      </div>
    </div>
  );
}
