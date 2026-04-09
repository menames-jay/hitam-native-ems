import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function EventDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect("/login");

  const event = await db.query.events.findFirst({
    where: eq(schema.events.id, id),
    with: {
      sessions: true,
      department: true
    }
  });

  if (!event) notFound();

  // Check if user is registered (Visual only for now)
  const isRegistered = false;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Back Button */}
      <Link href="/events" className="inline-flex items-center gap-2 mb-8 text-slate-500 font-bold hover:text-emerald-600 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        <span className="text-xs uppercase tracking-widest">Back to Events</span>
      </Link>

      {/* Hero Banner Section */}
      <div className="relative rounded-[3rem] overflow-hidden aspect-[16/9] md:aspect-[21/9] shadow-2xl mb-10 group">
        {event.coverImage ? (
          <img src={event.coverImage} className="w-full h-full object-cover" alt={event.title} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-9xl opacity-20">event_seat</span>
          </div>
        )}
        
        {/* Floating Category Badge */}
        <div className="absolute top-8 left-8">
           <span className="bg-white/20 backdrop-blur-xl border border-white/30 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] text-white">
              {event.type || 'Institutional'}
           </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-12">
           <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
                {event.title}
              </h1>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                 {event.description}
              </div>
           </div>

           {/* Sessions Section */}
           <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Activity Sessions</h3>
              <div className="space-y-4">
                {event.sessions && event.sessions.length > 0 ? (
                  event.sessions.map((s, idx) => (
                    <div key={s.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-white/5 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                             <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-emerald-600">Ssn</span>
                             <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-700">{idx + 1}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">Starts at {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                       </div>
                       <span className="material-symbols-outlined text-slate-200 group-hover:text-emerald-500 transition-colors">circle</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                     <p className="text-slate-500 font-medium">Session times are not finalized yet.</p>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Right Column: Information Sidebar */}
        <div className="space-y-8">
           <div className="bg-emerald-600 text-white rounded-[2.5rem] p-10 space-y-8 shadow-xl shadow-emerald-100 dark:shadow-none">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Registration Status</p>
                 <h4 className="text-2xl font-black">Open for All</h4>
              </div>

              <div className="space-y-5">
                 <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined opacity-60">calendar_today</span>
                    <div className="text-sm">
                       <p className="font-black">Date</p>
                       <p className="font-medium opacity-80">{new Date(event.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined opacity-60">pin_drop</span>
                    <div className="text-sm">
                       <p className="font-black">Venue</p>
                       <p className="font-medium opacity-80 truncate max-w-[150px]">{event.venueId || 'Central Auditorium'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined opacity-60">payments</span>
                    <div className="text-sm">
                       <p className="font-black">Access</p>
                       <p className="font-medium opacity-80">{event.price ? `₹${event.price}` : 'Complimentary Entry'}</p>
                    </div>
                 </div>
              </div>

              <button className="w-full py-5 bg-white text-emerald-600 font-extrabold rounded-2xl shadow-lg ring-offset-2 ring-offset-emerald-600 hover:scale-[1.02] active:scale-95 transition-all">
                {isRegistered ? "ALREADY REGISTERED" : "REGISTER NOW"}
              </button>
           </div>
           
           <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-10 space-y-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organized By</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                   <span className="material-symbols-outlined">hub</span>
                </div>
                <div>
                   <p className="font-black text-slate-900 dark:text-white">{event.department?.name || 'Institutional Events'}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">{event.department?.code || 'HITAM'}</p>
                </div>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}
