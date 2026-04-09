import { ReactNode } from "react";
import { BottomNavigationBar } from "./bottom-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { TopNotificationBar } from "./top-nav";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Component */}
      <BottomNavigationBar />
      
      {/* Desktop Components */}
      <DesktopSidebar />
      
      <div className="md:pl-64 flex flex-col min-h-screen">
        <TopNotificationBar />
        
        {/* Main Content Area: padding bottom on mobile to accommodate BottomNav */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
