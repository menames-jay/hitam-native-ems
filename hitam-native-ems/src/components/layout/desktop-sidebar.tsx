import Link from "next/link";
import { Home, Ticket, CalendarDays, User, LogOut, Settings } from "lucide-react";

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 border-r border-border bg-card/50 backdrop-blur-sm z-40">
      <div className="p-6 flex items-center gap-3">
        {/* Simple Brand Logo Anchor */}
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
          H
        </div>
        <span className="font-semibold text-lg tracking-tight">HITAM EMS</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Menu</p>
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Home className="h-5 w-5" />
          Dashboard
        </Link>
        <Link href="/explore" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all uppercase tracking-widest">
           <span className="material-symbols-outlined text-[20px]">explore</span>
           Explore Hub
        </Link>
        <Link href="/tickets" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Ticket className="h-5 w-5" />
          My Tickets
        </Link>

        <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6">Account</p>
        <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <User className="h-5 w-5" />
          Profile
        </Link>
        <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>

      <div className="p-4 border-t border-border">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
