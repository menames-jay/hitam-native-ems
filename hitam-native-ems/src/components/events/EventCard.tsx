"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: any;
}

export function EventCard({ event }: EventCardProps) {
  // Use category colors aligned with DB schema
  const categoryColors: Record<string, string> = {
    TECHNICAL: "bg-emerald-500",
    CLUB: "bg-amber-500",
    INSTITUTE: "bg-blue-600",
  };

  const categoryLabel = event.category || "GENERAL";
  const accentColor = categoryColors[categoryLabel] || "bg-slate-500";
  const isPast = event.sessions?.every((s: any) => new Date(s.endTime) < new Date());

  return (
    <Link 
      href={`/events/${event.id}`}
      className={cn(
        "group bg-white dark:bg-white/5 border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full",
        isPast ? "border-slate-100 dark:border-white/5 opacity-80" : "border-slate-100 dark:border-white/10"
      )}
    >
      <div className="relative h-48 overflow-hidden shrink-0">
        <div className={cn("absolute inset-0 opacity-10", accentColor)} />
        {event.coverImage ? (
          <img 
            src={event.coverImage} 
            alt={event.title} 
            className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-110", isPast && "grayscale-[0.5]")} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-slate-200">event</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
           <span className={cn(
             "px-4 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg",
             isPast ? "bg-slate-400" : accentColor
           )}>
             {isPast ? "Concluded" : event.category}
           </span>
        </div>
      </div>

      <div className="p-8 space-y-4 flex-grow">
        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Primary Date</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {event.sessions?.[0] ? new Date(event.sessions[0].startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}
              </p>
           </div>
        </div>

        <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
           <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-slate-900" />
              ))}
           </div>
           <p className={cn(
             "text-[10px] font-black uppercase tracking-widest",
             isPast ? "text-slate-400" : "text-emerald-600"
           )}>
             {isPast ? "Registration Closed" : "Register Now"}
           </p>
        </div>
      </div>
    </Link>
  );
}
