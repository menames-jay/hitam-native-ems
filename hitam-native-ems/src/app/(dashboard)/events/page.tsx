import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function EventsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect("/login");

  const events = await db.query.events.findMany({
    where: eq(schema.events.status, "PUBLISHED"),
    orderBy: [desc(schema.events.createdAt)],
  });

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <section className="px-2">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Explore Events</h1>
        <p className="text-slate-500 font-medium max-w-lg">Discover and register for the latest technical workshops, cultural fests, and campus activities.</p>
      </section>

      {/* Categories Filter (Visual Only for now) */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {['All', 'Technical', 'Cultural', 'Sports', 'Workshops', 'Competition'].map((cat, i) => (
          <button 
            key={cat} 
            className={cn(
              "px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300",
              i === 0 ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none" : "bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-1">
          {events.map((event) => (
            <Link 
              key={event.id}
              href={`/events/${event.id}`}
              className="group block bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-56 bg-slate-100 dark:bg-slate-800">
                {event.coverImage ? (
                  <img src={event.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <span className="material-symbols-outlined text-emerald-200 dark:text-emerald-800 text-6xl">event</span>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-5 right-5">
                   <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-lg">
                      {event.type || 'H-Event'}
                   </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                   <span className="material-symbols-outlined text-sm">schedule</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest">
                     {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-slate-50 dark:border-white/5">
                   <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                      <span className="text-xs font-bold truncate max-w-[120px]">{event.venueId || 'HITAM Campus'}</span>
                   </div>
                   <span className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <span className="material-symbols-outlined text-xl">east</span>
                   </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
           <span className="material-symbols-outlined text-7xl text-slate-200 mb-6 font-thin italic">sentiment_dissatisfied</span>
           <h3 className="text-2xl font-black text-slate-900 dark:text-white">No active events precisely now</h3>
           <p className="text-slate-500 font-medium mt-2">Check back later or browse archives.</p>
        </div>
      )}

    </div>
  );
}
