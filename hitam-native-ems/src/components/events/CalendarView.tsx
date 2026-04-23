"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: any[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  // Basic calendar logic (can be expanded)
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = Array.from({ length: numDays }, (_, i) => i + 1);
  const paddingSteps = Array.from({ length: startDay }, (_, i) => i);

  // Group event sessions by date
  const sessionsByDate: Record<string, any[]> = {};
  events.forEach(event => {
    event.sessions?.forEach((session: any) => {
      try {
        const dateObj = new Date(session.startTime);
        if (isNaN(dateObj.getTime())) return; // Skip invalid dates

        const dateKey = dateObj.toDateString();
        if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = [];
        sessionsByDate[dateKey].push({ 
          ...session, 
          eventTitle: event.title || "Untitled", 
          eventColor: event.category || "GENERAL" 
        });
      } catch (e) {
        console.error("Invalid session date encountered", session);
      }
    });
  });

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
      <header className="p-10 flex items-center justify-between border-b border-slate-50 dark:border-white/5">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{monthName} <span className="opacity-30">{year}</span></h3>
        <div className="flex gap-2">
           <button 
             onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
             className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center hover:bg-slate-100 transition-colors"
           >
             <span className="material-symbols-outlined">chevron_left</span>
           </button>
           <button 
             onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
             className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center hover:bg-slate-100 transition-colors"
           >
             <span className="material-symbols-outlined">chevron_right</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-7 text-center border-b border-slate-50 dark:border-white/5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-5 h-[600px]">
        {paddingSteps.map(i => (
          <div key={`p-${i}`} className="border-r border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-black/10" />
        ))}
        {days.map(day => {
          const date = new Date(year, month, day);
          const dateKey = date.toDateString();
          const daySessions = sessionsByDate[dateKey] || [];
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div key={day} className="border-r border-b border-slate-50 dark:border-white/5 p-4 space-y-2 relative group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors overflow-hidden">
               <span className={cn(
                 "text-sm font-black transition-colors px-2 py-1 rounded-lg",
                 isToday ? "bg-emerald-600 text-white" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
               )}>{day}</span>
               
               <div className="space-y-1">
                 {daySessions.slice(0, 3).map((s, idx) => (
                   <div key={idx} className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-1 rounded-lg truncate">
                      <p className="text-[9px] font-black text-emerald-600 truncate uppercase leading-tight">{s.eventTitle}</p>
                   </div>
                 ))}
                 {daySessions.length > 3 && (
                   <p className="text-[8px] font-bold text-slate-400 pl-1">+{daySessions.length - 3} more</p>
                 )}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
