"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { recordAttendance, getAttendanceSessionInfo } from "@/lib/actions/attendance";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface QRScannerProps {
  studentId: string;
  sessionId?: string;
}

export function QRScanner({ studentId, sessionId }: QRScannerProps) {
  const [sessionInfo, setSessionInfo] = useState<{ eventTitle: string, venueName: string } | null>(null);
  const [successData, setSuccessData] = useState<{ timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const router = useRouter();

  // Fetch session metadata for HUD
  useEffect(() => {
    if (sessionId) {
      getAttendanceSessionInfo(sessionId).then(info => {
        if (info) setSessionInfo({ eventTitle: info.eventTitle, venueName: info.venueName });
      });
    }
  }, [sessionId]);

  useEffect(() => {
    if (successData) return;

    const onScanSuccess = async (decodedText: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setError(null);

      try {
        const res = await recordAttendance("", decodedText, sessionId);
        if (res.success) {
          setSuccessData({ timestamp: new Date().toLocaleTimeString() });
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else {
          setError(res.error || "Attendance failed");
          setIsProcessing(false);
        }
      } catch (err) {
        setError("Failed to verify institutional QR");
        setIsProcessing(false);
      }
    };

    const onScanFailure = (error: any) => { };

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }
    };
  }, [successData, isProcessing, router, studentId]);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-[3.5rem] flex flex-col font-sans overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl">
      
      {/* Immersive HUD Header */}
      <div className="p-8 flex items-center justify-between z-10 bg-slate-900 dark:bg-transparent">
         <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20 shrink-0">
               <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            </div>
            <div className="min-w-0 flex-grow">
               <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] leading-none mb-1.5 truncate">
                 {sessionInfo ? sessionInfo.venueName : "Institutional Portal"}
               </p>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter italic truncate">
                 {sessionInfo ? sessionInfo.eventTitle : "HITAM Scanner"}
               </h3>
            </div>
         </div>
      </div>

      {/* Central Viewport Area */}
      <div className="flex flex-col items-center justify-center relative p-8 bg-slate-950">
         
         {/* Scan Viewport Container */}
         <div className="w-full aspect-square relative bg-black/60 rounded-[3rem] border-2 border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] group">
            <div id="reader" className="w-full h-full scale-[1.05]" />
            
            {/* HUD Overlay Graphics */}
            <div className="absolute inset-0 pointer-events-none z-10">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-[1px] border-emerald-500/20 rounded-[2.5rem] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-emerald-500/40 rounded-[2.5rem]" />
               
               {/* Animated Radial Pulse */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm animate-[scan-beam_3s_ease-in-out_infinite]" />
               </div>

               {/* Institutional Watermark Overlay */}
               <div className="absolute bottom-10 left-0 w-full text-center">
                  <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-[0.5em]">HITAM Optical Link • Established</span>
               </div>
               
               {/* Corner Accents */}
               <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-emerald-500/60" />
               <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-emerald-500/60" />
               <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-emerald-500/60" />
               <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-emerald-500/60" />
            </div>

            {/* Verification In-Progress Spinner */}
            {isProcessing && !successData && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center z-30 animate-in fade-in zoom-in duration-300">
                <div className="relative w-20 h-20 mb-6">
                   <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                   <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] animate-pulse">Syncing Ledger</p>
              </div>
            )}
         </div>

         {/* Success Narrative Overlay - High Fidelity Card */}
         <div className={cn(
           "absolute inset-0 bg-black/40 backdrop-blur-3xl z-50 flex flex-col items-center justify-center transition-all duration-700 p-10 text-center",
           successData ? "visible opacity-100 scale-100" : "invisible opacity-0 scale-95"
         )}>
            <div className="p-12 rounded-[4rem] bg-emerald-600 shadow-[0_0_100px_rgba(16,185,129,0.4)] border border-emerald-400/20 flex flex-col items-center max-w-xs animate-in zoom-in-95 duration-500 mx-auto">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-600 mb-8 shadow-2xl">
                 <span className="material-symbols-outlined text-5xl font-black">check</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Verified</h2>
              <p className="text-emerald-100 font-bold uppercase tracking-[0.1em] text-[8px] opacity-80 mb-6">Attendance Mapped: {successData?.timestamp}</p>
              <div className="h-[2px] w-12 bg-white/20 mb-6" />
              <p className="text-white/60 font-medium text-[10px] leading-relaxed">Your participation has been successfully synced with the academic ledger.</p>
            </div>
         </div>

         {/* Error Feedback */}
         {error && (
            <div className="absolute bottom-10 left-10 right-10 bg-red-600/90 backdrop-blur-md text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-bottom-2 border border-red-400/20 shadow-2xl z-20">
               <span className="material-symbols-outlined text-lg">error</span>
               {error}
               <button onClick={() => setError(null)} className="ml-auto hover:scale-125 transition-transform">✕</button>
            </div>
         )}
      </div>

      {/* Footer Utility Section */}
      <div className="p-10 flex flex-col items-center gap-6 bg-slate-50 dark:bg-transparent">
         <p className="text-[10px] text-slate-400 dark:text-white/30 font-black uppercase tracking-[0.2em] text-center max-w-[200px] leading-relaxed italic">
            Optical link status: Optimized • Academic sync ready
         </p>
         <Link 
            href="/attendance/scan/manual" 
            className="w-full max-w-[280px] py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] rounded-[1.5rem] transition-all text-center uppercase tracking-[0.3em] active:scale-95 shadow-xl hover:scale-[1.02]"
         >
            Use Manual Token
         </Link>
      </div>

      <style jsx>{`
        @keyframes scan-beam {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
