import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/navigation/Sidebar";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { RoleSwitcher } from "@/components/dev/RoleSwitcher";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  
  if (process.env.NODE_ENV !== "development") {
    try {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    } catch (e) {
      console.error("Auth Session Error:", e);
    }
  }

  if (!session && process.env.NODE_ENV !== "development") {
    redirect("/login");
  }

  // FORCE FRESH USER FETCH: Bypass session cache to see manual DB changes immediately
  let freshUser = null;
  if(session?.user?.id) {
    freshUser = await db.query.user.findFirst({
      where: eq(schema.user.id, session.user.id)
    });
  }

  // Developer Bypass
  const headersList = await headers();
  const devRole = process.env.NODE_ENV === "development" ? headersList.get("x-ems-role") : null;
  const role = devRole || (freshUser as any)?.role || "STUDENT";
  const userId = session?.user?.id || "dev";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f0a]">
      {/* Desktop Sidebar */}
      <Sidebar role={role} user={session?.user || { id: "dev", name: "Dev User", email: "dev@hitam.org" } as any} />
      
      {/* Main Content Area */}
      <main className="flex-grow md:ml-72 pb-24 md:pb-8 pt-8 px-4 md:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavbar role={role} />

      {/* Dev Switcher Tool (Visible in all environments for testing) */}
      <RoleSwitcher userId={userId} currentRole={role} />
    </div>
  );
}

