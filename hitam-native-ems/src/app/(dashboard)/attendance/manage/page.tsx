import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AttendanceControl } from "@/components/events/AttendanceControl";
import { DownloadReportButton } from "@/components/attendance/download-report";
import { cn } from "@/lib/utils";

export default async function Page({ searchParams }: { searchParams: Promise<{ session?: string, title?: string }> }) {
  const { session, title } = await searchParams;
  const authSession = await getServerSession();
  
  if (!authSession) {
    redirect("/login");
  }

  const userId = authSession.user.id;

  const userEvents = await db.query.events.findMany({
    where: eq(schema.events.createdBy, userId),
    with: {
      sessions: {
        with: {
          venue: true
        }
      }
    },
    orderBy: [desc(schema.events.createdAt)]
  });

  if (session) {
    return (
      <div className="space-y-10 animate-in fade-in zoom-in duration-500">
        <AttendanceControl 
          sessionId={session}
          eventTitle={title || "Institutional Event"}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Manager</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Select an active event session to initiate QR-based attendance tracking.
        </p>
      </header>
      
      <div className="grid grid-cols-1 gap-6">
        {userEvents.map((event) => (
          <div key={event.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{event.title}</h3>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{event.status}</p>
               </div>
                <div className="flex flex-wrap gap-4">
                   {event.sessions.map((session) => (
                     <div key={session.id} className="flex gap-2">
                       <a 
                         href={`?session=${session.id}&title=${encodeURIComponent(event.title)}`}
                         className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                       >
                         Start Attendance QR
                       </a>
                       <DownloadReportButton sessionId={session.id} />
                     </div>
                   ))}
                </div>
            </div>
          </div>
        ))}

        {userEvents.length === 0 && (
          <div className="bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 p-20 rounded-[3rem] text-center">
             <p className="text-slate-400 font-bold uppercase tracking-widest">No events found for management.</p>
          </div>
        )}
      </div>
    </div>
  );
}
