"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createEventAction } from "@/lib/actions/event";

interface Venue {
  id: string;
  name: string;
  capacity: number;
}

interface EventCreateFormProps {
  userId: string;
  userRole: string;
  workflowType: string;
  venues: Venue[];
  theme: { accent: string; text: string; bg: string };
  approvalChain: string[];
}

export function EventCreateForm({ 
  userId, 
  userRole, 
  workflowType, 
  venues, 
  theme, 
  approvalChain 
}: EventCreateFormProps) {
  const [isPaid, setIsPaid] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    const res = await createEventAction(formData);
    setIsPending(false);
    
    if (res.success) {
      alert("Event proposal submitted successfully!");
      window.location.href = "/dashboard";
    } else {
      alert("Failed to submit: " + res.error);
    }
  };

  return (
    <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Hidden internal fields */}
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="userRole" value={userRole} />
      <input type="hidden" name="type" value={workflowType === 'B' ? 'technical' : 'club'} />

      <div className="lg:col-span-2 space-y-8">
        {/* Section 1: Event Context */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", theme.bg)}>
              <span className={cn("material-symbols-outlined text-xl", theme.text)}>edit_note</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Event Details</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Title</label>
              <input 
                type="text" 
                name="title" 
                required
                placeholder="e.g., Annual Tech Symposium 2025" 
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
              <textarea 
                name="description" 
                required
                rows={4}
                placeholder="Clearly state the objectives and expected outcomes..." 
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 transition-all outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logistics & Schedule */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-blue-600 bg-blue-50")}>
              <span className="material-symbols-outlined text-xl">location_on</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Logistics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Venue Preference</label>
              <select 
                name="venueId" 
                required
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="">Select a Venue</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.capacity} pax)</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 invisible md:visible" />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Time</label>
              <input 
                type="datetime-local" 
                name="startTime" 
                required
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Time</label>
              <input 
                type="datetime-local" 
                name="endTime" 
                required
                className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pricing (NEW) */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm space-y-6 overflow-hidden relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-amber-600 bg-amber-50")}>
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ticket Settings</h2>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid Event</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isPaid"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-white rounded-full"></div>
              </label>
            </div>
          </div>

          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 origin-top",
            isPaid ? "opacity-100 max-h-[200px] scale-y-100" : "opacity-0 max-h-0 scale-y-0 pointer-events-none"
          )}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (INR)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input 
                  type="number" 
                  name="price" 
                  min="0"
                  placeholder="0" 
                  required={isPaid}
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 pl-12 pr-6 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                />
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1 mt-2">
                This price will be reviewed by the AO and HOD.
              </p>
            </div>
          </div>
          
          {!isPaid && (
            <p className="text-xs font-bold text-slate-400 italic">
              Registration will be free for all eligible participants.
            </p>
          )}
        </div>
      </div>

      {/* Sidebar: Governance Preview */}
      <div className="space-y-8">
         <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden h-fit">
            <div className="relative z-10 space-y-6">
               <div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Governance Chain</p>
                 <h3 className="text-2xl font-black">Workflow {workflowType}</h3>
               </div>

               <div className="space-y-4">
                  {approvalChain.map((approver, index) => (
                    <div key={approver} className="flex items-center gap-4">
                       <div className="flex flex-col items-center">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black", index === 0 ? theme.accent : "bg-slate-800")}>
                             {index + 1}
                          </div>
                          {index !== approvalChain.length - 1 && <div className="w-px h-6 bg-slate-800" />}
                       </div>
                       <span className={cn("text-xs font-bold", index === 0 ? "text-white" : "text-slate-500")}>
                          {approver} Approval
                       </span>
                    </div>
                  ))}
                  
                  {isPaid && (
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2 text-amber-500">
                        <span className="material-symbols-outlined text-sm">priority_high</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Price Validation Active</span>
                      </div>
                    </div>
                  )}
               </div>
               
               <div className="pt-4 space-y-4">
                 <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                   Your proposal will be routed automatically through the channels above. 
                   The AO will review any venue conflicts before final issuance.
                 </p>
                 <button 
                   type="submit"
                   disabled={isPending}
                   className={cn(
                     "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed", 
                     theme.accent
                   )}
                 >
                   {isPending ? "Submitting..." : "Submit Proposal"}
                 </button>
               </div>
            </div>
            
            {/* Decoration */}
            <div className={cn("absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl opacity-20", theme.accent)} />
         </div>
         
         <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Institutional Rule</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
              "Events must be submitted at least 14 days prior to the date for full budget and venue consideration."
            </p>
         </div>
      </div>
    </form>
  );
}
