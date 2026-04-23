import { getServerSession } from "@/lib/auth/role";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function MyEventsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const isStudent = session.user.role === 'STUDENT';

  // Fetch data based on role
  let eventsData = [];

  if (isStudent) {
    // For students: Show events they are REGISTERED for
    const registrations = await db.query.registrations.findMany({
      where: eq(schema.registrations.studentId, session.user.id),
      with: {
        event: {
          with: {
            sessions: { with: { venue: true } },
            creator: { with: { department: true } }
          }
        }
      }
    });
    eventsData = registrations.map(r => r.event);
  } else {
    // For other roles: Show events they AUTHORED
    eventsData = await db.query.events.findMany({
      where: eq(schema.events.createdBy, session.user.id),
      orderBy: [desc(schema.events.createdAt)],
      with: {
        sessions: { with: { venue: true } },
        creator: { with: { department: true } }
      }
    });
  }

  const { MyEventsTabs } = await import("@/components/events/MyEventsTabs");

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="px-2">
         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 block">Institutional Records</span>
         <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-none italic">
           {isStudent ? "My Registrations" : "My Authored Events"}
         </h1>
         <p className="text-slate-500 font-medium max-w-lg">
           {isStudent 
            ? "Track your participation and upcoming sessions for registered events."
            : "Manage and track all institutional events you have authored or coordinated."}
         </p>
      </header>

      {/* Main Container with Lifecycle Tabs */}
      <MyEventsTabs events={eventsData as any} />

    </div>
  );
}

