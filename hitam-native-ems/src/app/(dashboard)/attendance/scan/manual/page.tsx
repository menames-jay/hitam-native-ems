"use client";

import { useState } from "react";
import { recordAttendance } from "@/lib/actions/attendance";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ManualAttendancePage() {
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (code.length < 6) return;
    setIsPending(true);
    setError(null);
    
    try {
      // User ID will be extracted from session in the server action
      const res = await recordAttendance("", code);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setError(res.error || "Verification failed");
        setIsPending(false);
      }
    } catch (err) {
      setError("An institutional error occurred. Please retry.");
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-12 md:py-20 px-4 animate-in fade-in slide-in-from-bottom-6 duration-700 relative w-full max-w-lg mx-auto">
      
      {/* Success Overlay */}
      <div className={cn(
        "absolute inset-0 bg-emerald-600 z-50 flex flex-col items-center justify-center transition-all duration-700 text-center p-10",
        success ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}>
        <span className="material-symbols-outlined text-8xl text-white mb-6 animate-bounce">verified</span>
        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Logged!</h2>
        <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs opacity-80">Transitioning to record overview...</p>
      </div>

      {/* Header Info */}
      <div className="text-center mb-12">
         <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 uppercase italic">Enter Code</h1>
         <p className="text-slate-500 font-medium max-w-[280px] mx-auto text-sm leading-relaxed tracking-tight">Input the 6-digit session code provided by your coordinator.</p>
      </div>

      {/* Code Input */}
      <div className="w-full max-w-sm space-y-8">
         <input 
            type="text" 
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXXXX"
            className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[2.5rem] py-10 text-center text-4xl font-black tracking-[0.5em] text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none placeholder:text-slate-200 dark:placeholder:text-white/5"
         />

         {error && (
            <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>
         )}

         <button 
           onClick={handleSubmit}
           disabled={isPending || code.length < 6}
           className={cn(
             "w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm rounded-[2rem] shadow-2xl transition-all uppercase tracking-widest active:scale-95 disabled:opacity-20",
             isPending && "animate-pulse"
           )}
         >
            {isPending ? "Validating..." : "Confirm Attendance"}
         </button>

         <Link href="/scanner" className="flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
            <span className="text-xs uppercase tracking-widest">Back to Scanner</span>
         </Link>
      </div>

      {/* Info Card */}
      <div className="mt-20 bg-emerald-50 dark:bg-emerald-500/5 p-8 rounded-[3rem] border border-emerald-100 dark:border-emerald-500/10 flex items-center gap-5 max-w-sm w-full">
         <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            <span className="material-symbols-outlined">verified_user</span>
         </div>
         <p className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold leading-relaxed tracking-tight">
           Session tokens are temporary and expire 5 minutes after concluding. Ensure your coordinator has an active session.
         </p>
      </div>

    </div>
  );
}

