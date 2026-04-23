import { getServerSession } from "@/lib/auth/role";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { EventCreateForm } from "@/components/events/EventCreateForm";
import { seedVenues } from "@/lib/db/seed";

// Mapping themes for the form UI
const THEME_MAP: Record<string, { accent: string; text: string; bg: string }> = {
  STUDENT: { accent: "bg-[#2E7D32]", text: "text-[#2E7D32]", bg: "bg-[#2E7D32]/10" },
  STUDENT_COORDINATOR: { accent: "bg-[#10b981]", text: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  FACULTY: { accent: "bg-[#2b6cee]", text: "text-[#2b6cee]", bg: "bg-[#2b6cee]/10" },
  PROGRAM_HEAD: { accent: "bg-[#6366f1]", text: "text-[#6366f1]", bg: "bg-[#6366f1]/10" },
  HOD: { accent: "bg-[#1e3a8a]", text: "text-[#1e3a8a]", bg: "bg-[#1e3a8a]/10" },
  LEAD_SE: { accent: "bg-[#f59e0b]", text: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  AO: { accent: "bg-[#8b5cf6]", text: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/10" },
};

export default async function CreateEventPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Ensure venues are seeded (simple check for demo)
  const venues = await db.query.venues.findMany();
  if (venues.length === 0) {
    await seedVenues();
  }
  const freshVenues = await db.query.venues.findMany();

  const role = session.user.role;
  const theme = THEME_MAP[role] || THEME_MAP.STUDENT;

  // Governance logic: Workflow A (Coordinator) vs Workflow B (Faculty)
  const workflowType = role === 'FACULTY' ? 'B' : 'A';
  const approvalChain = workflowType === 'B' 
    ? ['Program Head', 'HOD', 'Lead SE', 'Admin Officer'] 
    : ['Lead SE', 'Admin Officer'];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <p className={cn("font-black text-[10px] uppercase tracking-[0.2em]", theme.text)}>
          Institutional Governance
        </p>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Create New Event
        </h1>
        <p className="text-slate-500 font-medium">
          Submit your event proposal for {workflowType === 'B' ? 'Technical' : 'Club'} governance review.
        </p>
      </header>

      <EventCreateForm 
        userId={session.user.id}
        userRole={role}
        workflowType={workflowType}
        venues={freshVenues}
        theme={theme}
        approvalChain={approvalChain}
      />
    </div>
  );
}
