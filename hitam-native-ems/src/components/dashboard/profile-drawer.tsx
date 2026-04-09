"use client";

import { useEffect } from "react";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    role: string;
    // Add additional metadata here later
  };
}

export function ProfileDrawer({ isOpen, onClose, user }: ProfileDrawerProps) {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 block" : "opacity-0 hidden"
        }`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-neutral-900 shadow-2xl z-50 transform transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] border-l border-primary/10 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary dark:text-primary">
              My Profile
            </h2>
            <button
              className="p-2 hover:bg-primary/5 rounded-full transition-colors text-gray-400 hover:text-primary"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 mb-4">
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-800 rounded-full">
                  <span className="material-symbols-outlined text-5xl text-gray-400">
                    person
                  </span>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {user.role} • {user.email}
            </p>
          </div>

          <nav className="flex-1 space-y-1">
            <a
              className="flex items-center gap-3 p-3.5 hover:bg-primary/5 rounded-xl transition-all group"
              href="#"
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">
                person
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary">
                Personal Details
              </span>
            </a>
            <a
              className="flex items-center gap-3 p-3.5 hover:bg-primary/5 rounded-xl transition-all group"
              href="#"
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">
                workspace_premium
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary">
                My Certificates
              </span>
            </a>
            <a
              className="flex items-center gap-3 p-3.5 hover:bg-primary/5 rounded-xl transition-all group"
              href="#"
            >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">
                history
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary">
                Activity History
              </span>
            </a>
          </nav>

          <button className="mt-auto w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
