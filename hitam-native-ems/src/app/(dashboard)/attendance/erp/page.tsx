import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export default async function ErpAttendancePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) redirect("/login");

  // Mock student data for ERP UI
  const students = [
    { rollNo: "21X41A0501", name: "Anish Kumar", status: "PRESENT" },
    { rollNo: "21X41A0502", name: "Brijesh Singh", status: "PRESENT" },
    { rollNo: "21X41A0503", name: "Chaitanya P", status: "ABSENT" },
    { rollNo: "21X41A0504", name: "Divya Reddy", status: "PRESENT" },
    { rollNo: "21X41A0505", name: "Eswar Rao", status: "PRESENT" },
    { rollNo: "21X41A0506", name: "Fathima Begum", status: "PRESENT" },
  ];

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Filters */}
      <section className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600">table_chart</span>
          ERP Attendance Submission
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Class</label>
             <select className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 p-4 rounded-2xl text-sm font-bold appearance-none">
               <option>CSE - III Year - Sec A</option>
               <option>CSE - III Year - Sec B</option>
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Date</label>
             <input type="date" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 p-4 rounded-2xl text-sm font-bold" defaultValue={new Date().toISOString().split('T')[0]} />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slot & Type</label>
             <select className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 p-4 rounded-2xl text-sm font-bold">
               <option>Regular (Academic)</option>
               <option>Affinity Hour (Engagement)</option>
             </select>
           </div>
        </div>
      </section>

      {/* Attendance Table (Desktop) / Cards (Mobile) */}
      <section className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.15em]">
                <th className="px-8 py-6 border-b border-slate-100 dark:border-white/5">S.No</th>
                <th className="px-8 py-6 border-b border-slate-100 dark:border-white/5">Roll Number</th>
                <th className="px-8 py-6 border-b border-slate-100 dark:border-white/5">Full Name</th>
                <th className="px-8 py-6 border-b border-slate-100 dark:border-white/5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-slate-900 dark:text-slate-300">
              {students.map((s, idx) => (
                <tr key={s.rollNo} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6 font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-8 py-6 font-black text-sm">{s.rollNo}</td>
                  <td className="px-8 py-6 font-bold text-sm tracking-tight">{s.name}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                       <div className={cn(
                          "w-12 h-12 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300",
                          s.status === 'PRESENT' 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none translate-y-[-2px]" 
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-200"
                       )}>
                          <span className="material-symbols-outlined text-2xl font-bold">check</span>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer Submission Actions */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50">
         <div className="bg-slate-900 dark:bg-white p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-6 px-10">
            <div className="text-white dark:text-slate-900">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Selected Count</span>
               <p className="text-xl font-black">38 / 42 Present</p>
            </div>
            <button className="bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
               SUBMIT TO ERP
            </button>
         </div>
      </div>

    </div>
  );
}
