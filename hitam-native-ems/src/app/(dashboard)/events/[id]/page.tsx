import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/auth/role";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function EventDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session) redirect("/login");

  const event = await db.query.events.findFirst({
    where: eq(schema.events.id, id),
    with: {
      sessions: {
        with: {
          venue: true
        }
      },
      creator: {
        with: {
          department: true
        }
      }
    }
  });

  if (!event) notFound();

  // Actual Institutional Registration Check
  const registration = await db.query.registrations.findFirst({
    where: and(
      eq(schema.registrations.eventId, id),
      eq(schema.registrations.studentId, session.user.id)
    )
  });
  
  const isRegistered = !!registration;

  // INSTITUTIONAL LIFECYCLE: Is the event past?
  const isPast = event.sessions.every(s => new Date(s.endTime) < new Date());

  // MANAGEMENT PRIVILEGE CHECK
  const isPrivileged = session.user.id === event.createdBy || 
                      ['ADMIN', 'LEAD_SE', 'AO'].includes(session.user.role);

  // INSTITUTIONAL WINDOW: +/- 10 Minutes
  const now = new Date();
  const TEN_MINS = 10 * 60 * 1000;
  
  const activeSessionsForAttendance = event.sessions.filter(s => {
    const startWindow = new Date(new Date(s.startTime).getTime() - TEN_MINS);
    const endWindow = new Date(new Date(s.endTime).getTime() + TEN_MINS);
    return now >= startWindow && now <= endWindow;
  });

  // Imports
  const { RegisterButton } = await import("@/components/events/RegisterButton");
  const { AttendanceControl } = await import("@/components/events/AttendanceControl");

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Back Button */}
      <Link href="/explore" className="inline-flex items-center gap-2 mb-8 text-slate-500 font-bold hover:text-emerald-600 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        <span className="text-xs uppercase tracking-widest">Back to Explore</span>
      </Link>

      {/* Hero Banner Section */}
      <div className="relative rounded-[3rem] overflow-hidden aspect-[16/9] md:aspect-[21/9] shadow-2xl mb-10 group">
        {event.coverImage ? (
          <img src={event.coverImage} className={cn("w-full h-full object-cover", isPast && "grayscale-[0.5]")} alt={event.title} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-9xl opacity-20">event_seat</span>
          </div>
        )}
        
        {/* Floating Category Badge */}
        <div className="absolute top-8 left-8">
           <span className="bg-white/20 backdrop-blur-xl border border-white/30 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] text-white">
              {isPast ? "CONCLUDED" : (event.category || 'Institutional')}
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

           {/* Management Mode (Coordinator Only) */}
           {isPrivileged && activeSessionsForAttendance.length > 0 && (
             <div className="space-y-6 animate-in zoom-in-95 duration-500 bg-emerald-50/50 dark:bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/10">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Institutional Control Mode</h3>
               </div>
               <div className="space-y-4">
                 {activeSessionsForAttendance.map(s => (
                   <AttendanceControl key={s.id} sessionId={s.id} eventTitle={`${event.title} - Active Session`} />
                 ))}
               </div>
             </div>
           )}

           {/* Activity Sessions Section */}
           <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Schedule & Venues</h3>
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
                            <p className="font-bold text-slate-900 dark:text-white">Session {idx + 1}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                               <span className="material-symbols-outlined text-[14px]">schedule</span>
                               <span>{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               <span className="mx-1">•</span>
                               <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                               <span>{s.venue?.name || "Main Campus"}</span>
                            </div>
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
                 <h4 className="text-2xl font-black">{isRegistered ? "Confirmed" : (isPast ? "Closed" : "Open for All")}</h4>
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
                       <p className="font-medium opacity-80 truncate max-w-[150px]">{event.sessions?.[0]?.venue?.name || 'Main Campus'}</p>
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

              {isRegistered ? (
                 <div className="space-y-4">
                    <div className="w-full py-5 bg-emerald-500/10 text-emerald-600 border-2 border-emerald-600/20 text-center font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                       <span className="material-symbols-outlined text-sm">verified</span>
                       ALREADY REGISTERED
                    </div>
                    
                    {activeSessionsForAttendance.length > 0 && (
                      <Link 
                        href={`/scanner?sessionId=${activeSessionsForAttendance[0].id}`}
                        className="w-full py-5 bg-slate-900 text-white text-center font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
                      >
                         <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
                         SCAN TO MARK ATTENDANCE
                      </Link>
                    )}
                 </div>
              ) : isPast ? (
                 <div className="w-full py-5 bg-slate-500/20 text-white border-2 border-white/10 text-center font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest opacity-60">
                    <span className="material-symbols-outlined text-sm">block</span>
                    REGISTRATION CLOSED
                 </div>
              ) : (
                 <RegisterButton 
                    eventId={event.id} 
                    studentId={session.user.id} 
                    isPaid={event.isPaid}
                    price={event.price}
                    eventTitle={event.title}
                 />
              )}
           </div>
        </div>

      </div>

    </div>
  );
}
