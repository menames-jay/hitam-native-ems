"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getPendingApprovalsAction, processApprovalAction } from "@/lib/actions/event";

interface ApprovalCenterProps {
  role: string;
  themeColor: string;
  bgAccent: string;
}

export function ApprovalCenter({ role, themeColor, bgAccent }: ApprovalCenterProps) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, [role]);

  const loadApprovals = async () => {
    setIsLoading(true);
    const res = await getPendingApprovalsAction(role);
    if (res.success) {
      setApprovals(res.approvals || []);
    }
    setIsLoading(false);
  };

  const handleAction = async (approvalId: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(approvalId);
    const res = await processApprovalAction(approvalId, status, remarks);
    setProcessingId(null);
    if (res.success) {
      setApprovals(prev => prev.filter(a => a.id !== approvalId));
      setShowRejectModal(null);
      setRemarks("");
      alert(`Event ${status.toLowerCase()} successfully!`);
    } else {
      alert("Error: " + res.error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-white/5 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 p-12 rounded-[2.5rem] text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-slate-300">inbox</span>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">All Caught Up!</h4>
          <p className="text-sm text-slate-500">No pending event proposals for your review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <div key={approval.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row gap-6 items-center">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", bgAccent.replace('bg-', 'bg-').concat('/10'))}>
            <span className={cn("material-symbols-outlined text-3xl", themeColor)}>
              {role === 'AO' ? 'location_on' : 'assignment_turned_in'}
            </span>
          </div>
          
          <div className="flex-grow text-center md:text-left space-y-1">
            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {approval.event?.title}
            </h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">person</span>
                Proposed by {approval.event?.creator?.name || 'Institutional Lead'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">payments</span>
                {approval.event?.isPaid ? `Paid: ₹${approval.event?.price}` : 'Free Event'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleAction(approval.id, "APPROVED")}
              disabled={processingId === approval.id}
              className={cn("px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50", bgAccent)}
            >
              {processingId === approval.id ? "Processing..." : "Approve"}
            </button>
            <button 
              onClick={() => setShowRejectModal(approval.id)}
              className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all"
            >
              Reject / Revise
            </button>
          </div>
        </div>
      ))}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Provide Feedback</h3>
              <p className="text-sm font-medium text-slate-500">Why are you rejecting or requesting a revision for this proposal?</p>
            </div>
            
            <textarea 
              className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
              rows={4}
              placeholder="e.g., Venue already booked, please adjust pricing, or missing details..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => handleAction(showRejectModal, "REJECTED")}
                disabled={!remarks || processingId === showRejectModal}
                className="flex-grow bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                Confirm Rejection
              </button>
              <button 
                onClick={() => { setShowRejectModal(null); setRemarks(""); }}
                className="px-8 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
