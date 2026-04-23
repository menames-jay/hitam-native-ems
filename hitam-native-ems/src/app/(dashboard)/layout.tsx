import { getServerSession } from "@/lib/auth/role";
import { Sidebar } from "@/components/navigation/Sidebar";
import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import { RoleSwitcher } from "@/components/dev/RoleSwitcher";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  
  if (!session && process.env.NODE_ENV !== "development") {
    redirect("/login");
  }

  const role = session?.user?.role || "STUDENT";
  const userId = session?.user?.id || "dev";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f0a]">
      {/* Desktop Sidebar */}
      <Sidebar role={role} user={session?.user} />
      
      {/* Main Content Area */}
      <main className="flex-grow md:ml-72 pb-24 md:pb-8 pt-8 px-4 md:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavbar role={role} />

      {/* Dev Switcher Tool (Visible in all environments for testing) */}
      <RoleSwitcher currentRole={role} />
    </div>
  );
}

