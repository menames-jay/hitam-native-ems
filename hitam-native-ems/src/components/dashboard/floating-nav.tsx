"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  isPrimary?: boolean;
}

export function FloatingNav({ items, onProfileClick }: { items: NavItem[], onProfileClick: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="nav-floating">
      {items.map((item, idx) => {
        const isActive = pathname === item.href;

        if (item.isPrimary) {
          return (
            <div key={idx} className="relative -top-6">
              <Link href={item.href}>
                <button className={`w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 border-4 border-background hover:scale-110 transition-all group`}>
                  <span className="material-symbols-outlined text-white text-3xl group-hover:rotate-12 transition-transform">
                    {item.icon}
                  </span>
                </button>
              </Link>
            </div>
          );
        }

        // It is the profile button
        if (item.label === "Profile") {
          return (
            <button
              key={idx}
              onClick={onProfileClick}
              className={`flex flex-col items-center gap-1 group focus:outline-none transition-all ${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500 hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-[9px] font-black uppercase tracking-tighter">
                {item.label}
              </span>
              <div className={`w-1 h-1 rounded-full mt-0.5 ${isActive ? "bg-primary" : "bg-transparent"}`}></div>
            </button>
          );
        }

        return (
          <Link
            key={idx}
            href={item.href}
            className={`flex flex-col items-center gap-1 group transition-all ${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500 hover:text-primary"}`}
          >
            <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform ${isActive ? "font-bold" : ""}`}>
              {item.icon}
            </span>
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {item.label}
            </span>
            <div className={`w-1 h-1 rounded-full mt-0.5 ${isActive ? "bg-primary" : "bg-transparent"}`}></div>
          </Link>
        );
      })}
    </nav>
  );
}
