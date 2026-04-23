"use client";

import { useState } from "react";
import { processApproval } from "@/lib/actions/approvals";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ApprovalCardProps {
  approval: any;
  userId: string;
  role: string;
  venues: any[];
}

export function ApprovalCard({ approval, userId, role, venues }: ApprovalCardProps) {
  const [isPending, setIsPending] = useState(false);
  const [comments, setComments] = useState("");
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState(approval.event?.sessions?.[0]?.venueId || "");

  const handleAction = async () => {
    if (!actionType) return;
    setIsPending(true);
    try {
      await processApproval(
        approval.id,
        actionType === "APPROVE" ? "APPROVED" : "REJECTED",
        comments,
        userId,
        selectedVenueId
      );
      setOpen(false);
    } catch (error) {
      console.error("Failed to process approval:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[3rem] shadow-sm group hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600"
          )}>
            <span className="material-symbols-outlined text-3xl">task</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {approval.event?.title || 'Unknown Event'}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 dark:bg-white/5 rounded-md">
                {approval.event?.category || 'GENERAL'}
              </span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-60">
                • Proposed by {approval.event?.creator?.name || 'Institutional Lead'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex gap-2 w-full md:w-auto">
              {/* Reject Trigger */}
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => setActionType("REJECT")}
                  className="flex-1 md:flex-none px-8 py-6 rounded-2xl font-black text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:border-white/10 transition-all uppercase tracking-widest"
                >
                  Reject
                </Button>
              </DialogTrigger>

              {/* Approve Trigger */}
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setActionType("APPROVE")}
                  className="flex-1 md:flex-none px-8 py-6 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-lg shadow-emerald-100 dark:shadow-none uppercase tracking-widest"
                >
                  Approve
                </Button>
              </DialogTrigger>
            </div>

            <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
              <div className={cn(
                "p-8",
                actionType === "APPROVE" ? "bg-emerald-600" : "bg-red-600"
              )}>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight">
                    {actionType === "APPROVE" ? "Confirm Approval" : "Reject Proposal"}
                  </DialogTitle>
                  <DialogDescription className="text-white/80 font-medium">
                    {actionType === "APPROVE" 
                      ? "You are endorsing this event for institutional progression." 
                      : "Please provide a reason for rejecting this institutional request."}
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
                <div className="space-y-4">
                  <Label htmlFor="comments" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Institutional Comments (Optional)
                  </Label>
                  <Input
                    id="comments"
                    placeholder="Provide additional context or feedback..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="bg-slate-50 dark:bg-white/5 border-none h-14 rounded-2xl font-bold px-6"
                  />
                </div>

                {role === "AO" && actionType === "APPROVE" && (
                  <div className="space-y-4">
                    <Label htmlFor="venue" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Final Venue Allocation
                    </Label>
                    <select
                      id="venue"
                      value={selectedVenueId}
                      onChange={(e) => setSelectedVenueId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border-none h-14 rounded-2xl font-bold px-6 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                    >
                      <option value="">Select Venue</option>
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (Cap: {v.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <DialogFooter className="flex sm:justify-between gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
                  <Button 
                    variant="ghost" 
                    onClick={() => setOpen(false)}
                    className="flex-1 font-black text-xs uppercase tracking-widest rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={handleAction}
                    disabled={isPending}
                    className={cn(
                      "flex-1 px-8 py-6 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all",
                      actionType === "APPROVE" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none" 
                        : "bg-red-600 text-white hover:bg-red-700 shadow-red-100 dark:shadow-none"
                    )}
                  >
                    {isPending ? "PROCESSING..." : "CONFIRM ACTION"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
