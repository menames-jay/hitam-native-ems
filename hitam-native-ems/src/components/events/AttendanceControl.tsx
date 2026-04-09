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
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-8 flex flex-col items-center text-center max-w-lg mx-auto">
      <div className="space-y-2">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Session</h3>
        <p className="text-slate-500 font-medium px-4">{eventTitle}</p>
      </div>

      {!token ? (
        <button 
          onClick={startSession}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-[#225c23] text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate Attendance QR"}
          <span className="material-symbols-outlined">qr_code_2</span>
        </button>
      ) : (
        <>
          <div className="p-8 bg-white rounded-[2.5rem] shadow-inner border border-slate-100">
            <QRCodeSVG value={token} size={256} level="H" />
          </div>

          <div className="space-y-4 w-full">
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fallback Code</p>
              <p className="text-4xl font-black text-primary tracking-[0.2em]">{fallbackCode}</p>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-6">
              Students can scan this QR or use the fallback code if the camera fails.
            </p>
          </div>

          <button 
            onClick={() => setToken(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
          >
            End Attendance Session
          </button>
        </>
      )}
    </div>
  );
}
