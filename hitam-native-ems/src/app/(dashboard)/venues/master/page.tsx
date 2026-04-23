"use client";

import { useState, useEffect } from "react";
import { listVenuesAction, createVenueAction, deleteVenueAction } from "@/lib/actions/venues";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function VenueMasterPage() {
  const { data: session } = useSession();
  const [venues, setVenues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCapacity, setNewCapacity] = useState(60);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setIsLoading(true);
    const res = await listVenuesAction();
    if (res.success) setVenues(res.venues || []);
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await createVenueAction(newName, newCapacity, session.user.id);
    if (res.success) {
      setIsAdding(false);
      setNewName("");
      fetchVenues();
    }
  };

  const handleDelete = async (id: string) => {
    if (!session || !confirm("Archive this institutional space?")) return;
    const res = await deleteVenueAction(id, session.user.id);
    if (res.success) fetchVenues();
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Header */}
      <section className="px-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-4">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block">Estate Governance</span>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Venues</h1>
            <div className="flex gap-2">
               <Link href="/venues/queue" className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Allocation Queue</Link>
               <span className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">Master Data</span>
            </div>
         </div>
         <button 
            onClick={() => setIsAdding(true)}
            className="px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
         >
            Add New Space
         </button>
      </section>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
         {venues.map((v) => (
            <div key={v.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                     onClick={() => handleDelete(v.id)}
                     className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                     <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
               </div>
               
               <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                     <span className="material-symbols-outlined">meeting_room</span>
                  </div>
                  
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{v.name}</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Resource</p>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-slate-300 text-sm">groups</span>
                     <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Capacity: {v.capacity} Users</span>
                  </div>
               </div>
            </div>
         ))}
         {!isLoading && venues.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No institutional venues registered</p>
            </div>
         )}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
              <header className="text-center">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Register Space</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Add new campus infrastructure</p>
              </header>

              <form onSubmit={handleCreate} className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Venue Name</label>
                    <input 
                       required
                       type="text" 
                       placeholder="e.g. Einstein Seminar Hall"
                       className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl font-bold text-sm outline-none"
                       value={newName}
                       onChange={(e) => setNewName(e.target.value)}
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Total Capacity</label>
                    <input 
                       required
                       type="number" 
                       className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl font-bold text-sm outline-none"
                       value={newCapacity}
                       onChange={(e) => setNewCapacity(parseInt(e.target.value))}
                    />
                 </div>

                 <div className="pt-6 flex gap-3">
                    <button 
                       type="button" 
                       onClick={() => setIsAdding(false)}
                       className="flex-grow bg-slate-100 dark:bg-white/10 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all font-sans"
                    >
                       Cancel
                    </button>
                    <button 
                       type="submit" 
                       className="flex-grow bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-200 dark:shadow-none"
                    >
                       Register Venue
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
