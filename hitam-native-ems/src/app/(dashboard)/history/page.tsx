import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";
import { getParticipationHistoryAction } from "@/lib/actions/history";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function ParticipationHistoryPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const res = await getParticipationHistoryAction(session.user.id);
  const history = res.success ? res.history : [];

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <section className="px-6 space-y-4">
         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] block">Institutional Ledger</span>
         <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">History</h1>
         <p className="text-slate-500 font-medium max-w-sm">Complete record of your verified participation, earned credentials, and institutional engagement.</p>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
         <div className="bg-slate-900 text-white p-6 rounded-[2rem] space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Events</h4>
            <p className="text-3xl font-black italic">{history.length}</p>
         </div>
         <div className="bg-emerald-600 text-white p-6 rounded-[2rem] space-y-1 shadow-xl shadow-emerald-100 dark:shadow-none">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Badges</h4>
            <p className="text-3xl font-black italic">{history.filter(h => !!h.credentialHash).length}</p>
         </div>
      </div>

      {/* Participation Timeline */}
      <div className="space-y-6 px-6">
         {history.length === 0 ? (
            <div className="py-24 bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-[3.5rem] flex flex-col items-center text-center">
               <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mb-6 font-sans">
                  <span className="material-symbols-outlined text-4xl">inventory_2</span>
               </div>
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Wallet Empty</h3>
               <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2">Attend events to earn verifiable institutional badges</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {history.map((record) => (
                  <div key={record.id} className="group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden">
                     
                     <div className="flex gap-6">
                        {/* Badge Visual Section */}
                        <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-white/10 flex flex-col items-center justify-center text-center p-2 group-hover:scale-105 transition-transform shadow-inner">
                           {record.credentialHash ? (
                             <>
                               <span className="material-symbols-outlined text-3xl text-emerald-600">verified</span>
                               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">Authentic</span>
                             </>
                           ) : (
                             <>
                               <span className="material-symbols-outlined text-3xl text-slate-300">pending</span>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending</span>
                             </>
                           )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-grow space-y-2">
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{record.eventSession?.event.category}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(record.scannedAt).toLocaleDateString()}</span>
                           </div>
                           <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase italic">{record.eventSession?.event.title}</h3>
                           <p className="text-[10px] font-medium text-slate-500 line-clamp-2">{record.eventSession?.event.description}</p>
                           
                           {record.credentialHash && (
                             <div className="pt-4 flex items-center justify-between">
                                <span className="text-[9px] font-mono text-slate-300">SIG: {record.credentialHash.substring(0, 10)}...</span>
                                <Link 
                                  href={`/verify/badge/${record.id}`} 
                                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black rounded-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                   Verify Ledger
                                </Link>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

    </div>
  );
}
