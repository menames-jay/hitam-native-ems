import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle"; // Might need a theme toggle or we just use the default dark mode switcher

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-grow flex flex-col bg-[#f0fdf4] dark:bg-[#141e14] selection:bg-primary selection:text-white min-h-screen relative overflow-hidden transition-colors duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,#f0fdf4_0%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_center,#064e3b_0%,#141e14_100%)] pointer-events-none transition-colors duration-300"></div>
      
      {/* Navbar overlay */}
      <nav className="relative z-50 bg-white/85 dark:bg-[#141e14]/80 backdrop-blur-md border-b border-primary/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="material-symbols-outlined text-white">school</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                HITAM <span className="text-primary font-light">EMS</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="#" className="hidden sm:block text-slate-600 dark:text-slate-300 hover:text-primary font-medium transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-xs">
          © 2026 Hyderabad Institute of Technology and Management
        </p>
      </footer>
    </div>
  );
}
