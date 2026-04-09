import Link from "next/link";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";

const CATEGORIES = [
  { id: 'all', label: 'All Events', icon: 'apps' },
  { id: 'tech', label: 'Technical', icon: 'code' },
  { id: 'cultural', label: 'Cultural', icon: 'theater_comedy' },
  { id: 'sports', label: 'Sports', icon: 'sports_soccer' },
  { id: 'workshop', label: 'Workshops', icon: 'school' },
];

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string, cat?: string }> }) {
  const { q, cat } = await searchParams;

  const liveEvents = await db.query.events.findMany({
    where: (events, { and, eq, or, ilike }) => {
      const conditions = [eq(events.status, 'PUBLISHED')];
      if (q) {
        conditions.push(or(ilike(events.title, `%${q}%`), ilike(events.description, `%${q}%`))!);
      }
      // Future: add category filter if mapped to schema
      return and(...conditions);
    },
    with: {
      creator: true,
      sessions: {
        with: {
          venue: true
        }
      }
    },
    orderBy: (events, { desc }) => [desc(events.createdAt)]
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Explore Events</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Discover and register for the latest technical workshops, cultural fests, and sports activities happening across the campus.
        </p>
      </header>

      {/* Search and Filters */}
      <form action="/explore" className="sticky top-0 z-10 py-4 bg-slate-50/80 dark:bg-[#0a0f0a]/80 backdrop-blur-md flex flex-col gap-4">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            name="q"
            defaultValue={q}
            type="text" 
            placeholder="Search for hackathons, workshops, etc..."
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => (
            <Link 
              key={category.id}
              href={`/explore?cat=${category.id}${q ? `&q=${q}` : ''}`}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full border whitespace-nowrap transition-all duration-300 font-bold text-sm",
                (cat === category.id || (!cat && category.id === 'all'))
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-primary/50"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{category.icon}</span>
              {category.label}
            </Link>
          ))}
        </div>
      </form>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
        {liveEvents.map((event) => {
          const mainSession = event.sessions[0];
          const formattedDate = mainSession ? new Date(mainSession.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "TBA";
          const formattedTime = mainSession ? new Date(mainSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

          return (
            <Link 
              key={event.id}
              href={`/events/${event.id}`}
              className="bg-white dark:bg-white/5 group rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="h-56 relative overflow-hidden">
                <img 
                  src={event.coverImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute top-5 left-5">
                  <span className="px-4 py-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl text-[10px] font-black text-white uppercase tracking-wider">
                    {event.isPaid ? 'Paid' : 'Free'}
                  </span>
                </div>
                {event.isPaid && (
                  <div className="absolute bottom-5 right-5">
                    <div className="bg-primary text-white font-black px-4 py-2 rounded-2xl shadow-lg text-sm">
                      ₹{event.price}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-7 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">By {event.creator?.name || "HITAM"}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                    <span className="material-symbols-outlined text-[20px] text-primary/70">event</span>
                    {formattedDate} {formattedTime ? `• ${formattedTime}` : ''}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                    <span className="material-symbols-outlined text-[20px] text-primary/70">location_on</span>
                    {mainSession?.venue?.name || "Conference Hall"}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5 text-[11px] font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                  View Details
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {liveEvents.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No events matching your search were found.</p>
        </div>
      )}
    </div>
  );
}
