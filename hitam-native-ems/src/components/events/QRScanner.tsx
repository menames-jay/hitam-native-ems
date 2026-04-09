"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { logAttendanceAction } from "@/lib/actions/attendance";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  studentId: string;
}

export function QRScanner({ studentId }: QRScannerProps) {
  const [successData, setSuccessData] = useState<{ eventTitle: string, timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fallbackCode, setFallbackCode] = useState("");

  useEffect(() => {
    if (successData) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const onScanSuccess = async (decodedText: string) => {
      scanner.clear();
      await handleLogAttendance(decodedText);
    };

    const onScanFailure = (error: any) => { };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner:", err));
    };
  }, [successData]);

  const handleLogAttendance = async (tokenOrCode: string) => {
    setIsProcessing(true);
    setError(null);
    const res = await logAttendanceAction(tokenOrCode, studentId);
    setIsProcessing(false);

    if (res.success) {
      setSuccessData({
        eventTitle: res.eventTitle || "Workshop",
        timestamp: res.timestamp || new Date().toLocaleTimeString()
      });
    } else {
      setError(res.error || "Failed to log attendance");
    }
  };

  // SUCCESS STATE (Stitch Design V2)
  if (successData) {
    return (
      <div className="w-full max-w-md mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-primary tracking-tighter italic">HITAM EMS</h1>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl text-primary font-black">check_circle</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Attendance Marked Successfully!</h2>
              <p className="text-slate-500 font-medium">Your presence has been recorded.</p>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Event</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{successData.eventTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">3 Hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{successData.timestamp}</span>
              </div>
            </div>

            <button
              onClick={() => window.location.href = "/dashboard"}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
            >
              Go Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20 md:pb-0">
      <div className="space-y-1 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter italic mb-2 md:mb-4">HITAM EMS</h1>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Scanner</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Align the QR code within the frame to check-in</p>
      </div>

      <div className="relative aspect-square overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border-4 md:border-8 border-white dark:border-white/5 bg-slate-50 dark:bg-white/5 shadow-2xl group">
        <div id="reader" className="w-full h-full" />
        
        {/* Scanning Overlay (Stitch) */}
        {!isProcessing && !error && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8 md:p-12">
            <div className="w-full h-full border-2 border-primary border-dashed rounded-[1.5rem] md:rounded-[2rem] opacity-30 animate-pulse" />
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-[#0a0f0a]/90 backdrop-blur-md flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[9px] md:text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">Verifying Attendance...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-red-50/95 dark:bg-red-950/95 backdrop-blur-md flex items-center justify-center p-6 md:p-10 text-center">
            <div className="space-y-4 md:space-y-6">
              <span className="material-symbols-outlined text-4xl md:text-5xl text-red-500">error</span>
              <p className="text-xs md:text-sm font-black text-red-900 dark:text-red-200 uppercase tracking-widest leading-relaxed">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-6 py-2 md:px-8 md:py-3 bg-red-600 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest"
              >
                Dismiss & Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fallback Input (Stitch Style) */}
      <div className="p-5 md:p-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2.5rem] md:rounded-[3rem] space-y-4 md:space-y-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-white/10" />
        <div className="space-y-1">
          <h4 className="text-xs md:text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">Camera issues?</h4>
          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enter the 8-character manual code</p>
        </div>
        
        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            placeholder="X7Y2Z9..."
            className="flex-grow bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 font-black text-center text-base md:text-lg uppercase tracking-[0.2em] outline-none focus:ring-2 focus:ring-primary transition-all"
            value={fallbackCode}
            onChange={(e) => setFallbackCode(e.target.value)}
          />
          <button
            onClick={() => handleLogAttendance(fallbackCode)}
            disabled={fallbackCode.length < 4 || isProcessing}
            className="px-5 md:px-8 bg-primary hover:scale-105 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
