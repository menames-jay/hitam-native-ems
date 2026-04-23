"use client";

import { useState } from "react";
import { setDevRoleAction } from "@/lib/actions/dev";
import { createEventAction } from "@/lib/actions/event";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ROLES = [
  "STUDENT_COORDINATOR",
  "FACULTY",
  "PROGRAM_HEAD",
  "HOD",
  "LEAD_SE",
  "AO",
  "ADMIN",
];

import { simulateArchivalAction, simulatePaymentBreachAction } from "@/lib/actions/test-simulations";

export default function TestHarnessPage() {
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [lastRegistrationId, setLastRegistrationId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSetRole = async (role: string | null) => {
    await setDevRoleAction(role);
    setCurrentRole(role);
    alert(`Switched to role: ${role || 'Default (Session)'}`);
  };

  const handleCreateTestEvent = async (type: 'Club' | 'Technical') => {
    setIsCreating(true);
    const formData = new FormData();
    formData.append("title", `PROPOSAL: BROWSER TEST ${type.toUpperCase()} EVENT`);
    formData.append("description", `Automated institutional approval workflow test for ${type} governance.`);
    formData.append("type", type.toLowerCase());
    formData.append("userId", "user_mock_123");
    formData.append("userRole", type === 'Club' ? 'STUDENT_COORDINATOR' : 'FACULTY');
    formData.append("startTime", new Date(Date.now() + 86400000).toISOString()); // Tomorrow
    formData.append("endTime", new Date(Date.now() + 93600000).toISOString()); // Tomorrow + 2h
    formData.append("venueId", ""); 

    const res = await createEventAction(formData);
    setIsCreating(false);
    if (res.success) {
      setLastEventId(res.eventId || null);
      alert(`Event Created! Next Step: Approve as ${type === 'Club' ? 'LEAD_SE' : 'PROGRAM_HEAD'}`);
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleSimulateArchival = async () => {
    if (!lastEventId) return alert("Error: Please create a test event first.");
    setIsSimulating(true);
    const res = await simulateArchivalAction(lastEventId);
    setIsSimulating(false);
    if (res.success) {
      alert("Success: Event backdated to 15 days ago and status set to COMPLETED. Inngest job can now process this.");
    } else {
      alert("Simulation Failed: " + res.error);
    }
  };

  const handleSimulateBreach = async () => {
    const regId = prompt("Enter a Registration ID to simulate breach (or will use a dummy):") || "reg_breach_test";
    setIsSimulating(true);
    const res = await simulatePaymentBreachAction(regId);
    setIsSimulating(false);
    if (!res.success) {
      alert(`UAT P-03 Success: Breach Detected & Blocked! Error: ${res.error}`);
    } else {
      alert("UAT Failure: Invalid payment was accepted. Infrastructure breach!");
    }
  };

  return (
    <div className="p-10 space-y-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Workflow Test Harness</h1>
        <p className="text-slate-500 font-medium">Easily switch roles and initiate institutional governance sequences for end-to-end verification.</p>
      </section>

      {/* Role Switcher */}
      <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[3rem] space-y-6">
        <div>
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Browser Identity</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {ROLES.map((role) => (
               <button
                 key={role}
                 onClick={() => handleSetRole(role)}
                 className={cn(
                   "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                   currentRole === role 
                     ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-2 border-slate-900 dark:border-white"
                     : "bg-white dark:bg-white/10 text-slate-500 border border-slate-200 dark:border-white/10 hover:border-slate-900 dark:hover:border-white"
                 )}
               >
                 {role.replace('_', ' ')}
               </button>
             ))}
             <button
               onClick={() => handleSetRole(null)}
               className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all focus:ring-0 outline-none"
             >
               RESET ROLE
             </button>
           </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-emerald-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-emerald-100 dark:shadow-none space-y-6">
            <div className="space-y-1">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Workflow A</span>
               <h2 className="text-3xl font-black">Club Event</h2>
               <p className="text-emerald-100 text-sm font-medium">Chain: Coordinator &rarr; Lead SE &rarr; AO</p>
            </div>
            <button 
              onClick={() => handleCreateTestEvent('Club')}
              disabled={isCreating}
              className="w-full bg-white text-emerald-600 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {isCreating ? "PRODUCING..." : "CREATE WORKFLOW TEST"}
            </button>
         </div>

         <div className="bg-blue-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-blue-100 dark:shadow-none space-y-6">
            <div className="space-y-1">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Workflow B</span>
               <h2 className="text-3xl font-black">Technical Event</h2>
               <p className="text-blue-100 text-sm font-medium">Chain: Faculty &rarr; PH &rarr; HOD &rarr; Lead SE &rarr; AO</p>
            </div>
            <button 
              onClick={() => handleCreateTestEvent('Technical')}
              disabled={isCreating}
              className="w-full bg-white text-blue-600 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {isCreating ? "PRODUCING..." : "CREATE WORKFLOW TEST"}
            </button>
         </div>
      </div>

      {/* Simulation Suite */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-2">UAT Simulation Suite</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] space-y-4">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined">auto_delete</span>
             </div>
             <div>
                <h4 className="font-black text-slate-900 dark:text-white">L-01: 14-Day Archival</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Force an event to backdate 15 days to trigger archival jobs.</p>
             </div>
             <button 
                onClick={handleSimulateArchival}
                disabled={isSimulating}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-colors"
                >
                Simulate Archival
             </button>
          </div>

          <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] space-y-4">
             <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
                <span className="material-symbols-outlined">gpp_bad</span>
             </div>
             <div>
                <h4 className="font-black text-slate-900 dark:text-white">P-03: Security Breach</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Simulate an invalid Razorpay signature verification attempt.</p>
             </div>
             <button 
                onClick={handleSimulateBreach}
                disabled={isSimulating}
                className="w-full py-3 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-colors"
                >
                Simulate Breach
             </button>
          </div>
        </div>
      </div>

      {/* active state displays */}
      {(lastEventId || lastRegistrationId) && (
        <div className="flex gap-4">
          {lastEventId && (
            <div className="p-6 bg-slate-900 text-white rounded-[2rem] animate-in zoom-in-95 duration-500 flex-grow">
               <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Active Test Event</p>
               <p className="font-mono text-xs">{lastEventId}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap gap-4 pt-10 border-t border-slate-100 dark:border-white/10">
         <Link href="/approvals" className="px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:translate-y-[-2px] transition-all">
            Open Approval Center
         </Link>
         <Link href="/calendar" className="px-8 py-4 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all dark:text-white">
            View Calendar
         </Link>
      </div>
    </div>
  );
}
