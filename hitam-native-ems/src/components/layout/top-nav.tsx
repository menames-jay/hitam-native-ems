import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopNotificationBar() {
  return (
    <header className="hidden md:flex h-16 w-full items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6 sticky top-0 z-30">
      <div className="flex w-1/3 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events, venues..."
            className="w-full bg-muted/50 pl-9 border-none shadow-none focus-visible:ring-1"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 ml-2 border-l border-border pl-4">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">Logged In</p>
            <p className="text-xs text-muted-foreground mt-1">student@hitam.org</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-primary">
            S
          </div>
        </div>
      </div>
    </header>
  );
}
