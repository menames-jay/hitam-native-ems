"use client";

import { useState } from "react";
import { TopHeader } from "./top-header";
import { FloatingNav, NavItem } from "./floating-nav";
import { ProfileDrawer } from "./profile-drawer";

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function DashboardShell({ children, navItems, user }: DashboardShellProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="relative min-h-screen pb-40">
      <TopHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28">
        {children}
      </main>

      <FloatingNav 
        items={navItems} 
        onProfileClick={() => setIsProfileOpen(true)} 
      />

      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
      />
    </div>
  );
}
