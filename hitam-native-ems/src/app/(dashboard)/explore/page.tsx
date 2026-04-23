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

  const rawEvents = await db.query.events.findMany({
    where: (events, { and, eq, or, ilike }) => {
      const conditions = [eq(events.status, 'PUBLISHED')];
      if (q) {
        conditions.push(or(ilike(events.title, `%${q}%`), ilike(events.description, `%${q}%`))!);
      }
      return and(...conditions);
    },
    with: {
      creator: { with: { department: true } },
      sessions: {
        with: {
          venue: true
        }
      }
    },
    orderBy: (events, { desc }) => [desc(events.createdAt)]
  });

  // INSTITUTIONAL LIFECYCLE FILTERING
  const now = new Date();
  const liveEvents = rawEvents.filter(event => {
    // Show only if at least one session ends in the future
    return event.sessions.some(s => new Date(s.endTime) > now);
  });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="px-2 space-y-4">
        <div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 block">Discovery Hub</span>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none italic">Explore Events</h2>
        </div>
        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
          Discover and register for the latest technical workshops, cultural fests, and sports activities happening across the campus.
        </p>
      </header>

      {/* Search and Filters */}
      <div className="sticky top-0 z-10 py-6 bg-slate-50/80 dark:bg-[#0a0f0a]/80 backdrop-blur-md">
        <form action="/explore" className="max-w-4xl space-y-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">search</span>
            <input 
              name="q"
              defaultValue={q}
              type="text" 
              placeholder="Search for hackathons, workshops, fests..."
              className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-black text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
            {CATEGORIES.map((category) => (
              <Link 
                key={category.id}
                href={`/explore?cat=${category.id}${q ? `&q=${q}` : ''}`}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl border whitespace-nowrap transition-all duration-300 font-black text-[10px] uppercase tracking-widest",
                  (cat === category.id || (!cat && category.id === 'all'))
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none" 
                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-emerald-500/50"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
                {category.label}
              </Link>
            ))}
          </div>
        </form>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {liveEvents.map((event) => {
          const mainSession = event.sessions[0];
          const formattedDate = mainSession ? new Date(mainSession.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBA";
          
          return (
            <Link 
              key={event.id}
              href={`/events/${event.id}`}
              className="bg-white dark:bg-white/5 group rounded-[3rem] border border-slate-100 dark:border-white/10 overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              <div className="h-64 relative overflow-hidden">
                <img 
                  src={event.coverImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute top-6 left-6">
                  <span className="px-5 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    {event.category || 'Institutional'}
                  </span>
                </div>
                {event.isPaid && (
                  <div className="absolute bottom-6 right-6">
                    <div className="bg-emerald-600 text-white font-black px-5 py-2 rounded-2xl shadow-xl text-xs uppercase tracking-widest">
                      ₹{event.price}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight underline decoration-transparent group-hover:decoration-emerald-500 transition-all">{event.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-emerald-600">hub</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.creator?.department?.name || "HITAM Central"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">When</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{formattedDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Where</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{mainSession?.venue?.name || "Main Campus"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 group-hover:translate-x-1 transition-transform">
                  Register for access
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {liveEvents.length === 0 && (
        <div className="text-center py-32 bg-slate-50 dark:bg-white/5 rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/10 mx-2">
          <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">event_busy</span>
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">No active sessions found</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Check back soon for new institutional activities.</p>
        </div>
      )}
    </div>
  );
}
