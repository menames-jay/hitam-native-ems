"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generateAttendanceTokenAction } from "@/lib/actions/attendance";
import { cn } from "@/lib/utils";

interface AttendanceControlProps {
  sessionId: string;
  eventTitle: string;
}

export function AttendanceControl({ sessionId, eventTitle }: AttendanceControlProps) {
  const [token, setToken] = useState<string | null>(null);
  const [fallbackCode, setFallbackCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startSession = async () => {
    setIsLoading(true);
    const res = await generateAttendanceTokenAction(sessionId);
    if (res.success) {
      setToken(res.token!);
      setFallbackCode(res.fallbackCode!);
    } else {
      alert("Error: " + res.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-emerald-100 dark:border-emerald-500/10 rounded-3xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-500">
      
      {!token ? (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined">qr_code_scanner</span>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Generate Session Token</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{eventTitle}</p>
            </div>
          </div>
          <button 
            onClick={startSession}
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
          >
            {isLoading ? "PRODUCING..." : "START ATTENDANCE"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-inner">
              <QRCodeSVG value={token} size={180} level="H" />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button 
                onClick={() => setToken(null)}
                className="text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                End Session
              </button>
              <span className="text-slate-200">|</span>
              <button 
                onClick={startSession}
                disabled={isLoading}
                className="text-emerald-500 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                {isLoading ? "Regenerating..." : "Regenerate Token"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Manual Fallback Code</p>
              <p className="text-4xl font-black text-emerald-600 tracking-[0.2em]">{fallbackCode}</p>
            </div>
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Institutional Rule
               </div>
               <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                 Display this QR on the projector. This token expires in 60 minutes. Attendance is linked to the active ERP ledger.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
