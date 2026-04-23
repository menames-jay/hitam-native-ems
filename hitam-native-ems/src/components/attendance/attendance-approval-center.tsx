"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getPendingAttendanceSubmissions, approveErpSubmission } from "@/lib/actions/attendance";
import { Button } from "@/components/ui/button";

export function AttendanceApprovalCenter() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    const res = await getPendingAttendanceSubmissions();
    if (res.success) {
      setSubmissions(res.submissions || []);
    }
    setIsLoading(false);
  };

  const handleApprove = async (submissionId: string) => {
    setProcessingId(submissionId);
    try {
      const res = await approveErpSubmission(submissionId);
      if (res.success) {
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      } else {
        alert("Approval Failed: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Institutional Error: Failed to connect to ledger.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="h-40 bg-slate-100 dark:bg-white/5 rounded-[3rem]" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 p-16 rounded-[4rem] text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-emerald-600 text-4xl">verified</span>
        </div>
        <div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Audit Complete</h4>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">All academic attendance snapshots for your department have been reviewed and approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {submissions.map((sub) => {
        const data = sub.attendanceData as any;
        const records = Array.isArray(data) ? data : (data?.records || []);
        
        const studentCount = records.length;
        const presentCount = records.filter((s: any) => s.status === "PRESENT").length;

        return (
          <div key={sub.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[3rem] shadow-sm hover:border-blue-500/30 transition-all flex flex-col md:flex-row gap-8 items-center group">
            <div className="w-20 h-20 rounded-[2rem] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-blue-600 text-4xl italic">history_edu</span>
            </div>
            
            <div className="flex-grow text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                  Section {sub.section} • Year {sub.classYear}
                </h4>
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full tracking-widest uppercase">
                  Slot {sub.slotNumber}
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Faculty: <span className="text-slate-900 dark:text-white">{sub.faculty?.name}</span>
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">group</span>
                  Ledger: <span className="text-emerald-600">{presentCount} Present</span> / {studentCount} Total
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {new Date(sub.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button 
                onClick={() => handleApprove(sub.id)}
                disabled={processingId === sub.id}
                className="w-full md:w-auto px-10 py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {processingId === sub.id ? "Syncing..." : "Approve Sync"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
