import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ManualAttendancePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect("/login");

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header Info */}
      <div className="text-center mb-12">
         <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">Enter Code</h1>
         <p className="text-slate-500 font-medium max-w-[280px] mx-auto">Input the 6-digit session code provided by your coordinator.</p>
      </div>

      {/* Code Input (Mockup for now) */}
      <div className="flex gap-3 mb-10">
         {[1, 2, 3, 4, 5, 6].map((i) => (
           <div key={i} className="w-12 h-16 md:w-16 md:h-20 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-400">
              -
           </div>
         ))}
      </div>

      {/* Keypad Placeholder / Action Area */}
      <div className="w-full max-w-sm space-y-6">
         <button className="w-full py-6 bg-emerald-600 text-white font-black text-lg rounded-[2rem] shadow-xl shadow-emerald-100 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all">
            SUBMIT ATTENDANCE
         </button>

         <Link href="/scanner" className="flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
            <span className="text-xs uppercase tracking-widest">Back to Scanner</span>
         </Link>
      </div>

      {/* Info Card */}
      <div className="mt-16 bg-slate-50 dark:bg-white/5 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/10 flex items-center gap-4 max-w-sm w-full">
         <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">help_outline</span>
         </div>
         <p className="text-xs text-slate-500 font-medium leading-relaxed">
           Attendance codes expire 5 minutes after the session concludes.
         </p>
      </div>

    </div>
  );
}
