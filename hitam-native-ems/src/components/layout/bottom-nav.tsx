import Link from "next/link";
import { Home, Ticket, CalendarDays, User } from "lucide-react";

export function BottomNavigationBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        <Link href="/dashboard" className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group">
          <Home className="w-6 h-6 mb-1 text-muted-foreground group-hover:text-primary" />
          <span className="text-xs text-muted-foreground group-hover:text-primary">Home</span>
        </Link>
        <Link href="/explore" className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group">
          <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">explore</span>
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary mt-1">Explore</span>
        </Link>
        <Link href="/tickets" className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group">
          <Ticket className="w-6 h-6 mb-1 text-muted-foreground group-hover:text-primary" />
          <span className="text-xs text-muted-foreground group-hover:text-primary">Tickets</span>
        </Link>
        <Link href="/profile" className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group">
          <User className="w-6 h-6 mb-1 text-muted-foreground group-hover:text-primary" />
          <span className="text-xs text-muted-foreground group-hover:text-primary">Profile</span>
        </Link>
      </div>
    </div>
  );
}
