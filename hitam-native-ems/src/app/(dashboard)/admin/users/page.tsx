"use client";

import { useState, useEffect } from "react";
import { listUsersAction, updateUserAction } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

export default function UserManagementPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, [query]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await listUsersAction(query);
    if (res.success) setUsers(res.users || []);
    setIsLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !session) return;

    const res = await updateUserAction(editingUser.id, {
      role: editingUser.role,
      rollNumber: editingUser.rollNumber,
      section: editingUser.section,
      classYear: parseInt(editingUser.classYear),
      adminId: session.user.id
    });

    if (res.success) {
      setEditingUser(null);
      fetchUsers();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Header */}
      <section className="px-2 space-y-4">
         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block">Identity Control</span>
         <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">User Hub</h1>
         <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
            <input 
               type="text" 
               placeholder="Search by name, email, or roll number..."
               className="flex-grow bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
            />
         </div>
      </section>

      {/* Users Table */}
      <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-xl overflow-x-auto">
         <table className="w-full text-left">
            <thead>
               <tr className="border-b border-slate-50 dark:border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credential</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Governance</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
               {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                     <td className="px-8 py-6">
                        <div className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{u.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{u.rollNumber || 'H-FACULTY'}</div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{u.section || '---'}</div>
                     </td>
                     <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black rounded-full uppercase tracking-widest">
                           {u.role}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <button 
                           onClick={() => setEditingUser({...u})}
                           className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                           <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                     </td>
                  </tr>
               ))}
               {!isLoading && users.length === 0 && (
                  <tr>
                     <td colSpan={4} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">No records found matching query</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
              <header className="text-center space-y-1">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Institutional Edit</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{editingUser.email}</p>
              </header>

              <form onSubmit={handleUpdate} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identity Role</label>
                       <select 
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl font-bold text-sm outline-none"
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                       >
                          {['STUDENT', 'STUDENT_COORDINATOR', 'FACULTY', 'PROGRAM_HEAD', 'HOD', 'LEAD_SE', 'AO', 'ADMIN'].map(r => (
                             <option key={r} value={r}>{r}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Roll Number</label>
                       <input 
                          type="text" 
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl font-bold text-sm outline-none"
                          value={editingUser.rollNumber || ""}
                          onChange={(e) => setEditingUser({...editingUser, rollNumber: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Section</label>
                       <input 
                          type="text" 
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl font-bold text-sm outline-none"
                          value={editingUser.section || ""}
                          onChange={(e) => setEditingUser({...editingUser, section: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Class Year</label>
                       <input 
                          type="number" 
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl font-bold text-sm outline-none"
                          value={editingUser.classYear || ""}
                          onChange={(e) => setEditingUser({...editingUser, classYear: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="pt-6 flex gap-3">
                    <button 
                       type="button" 
                       onClick={() => setEditingUser(null)}
                       className="flex-grow bg-slate-100 dark:bg-white/10 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                       type="submit" 
                       className="flex-grow bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
                    >
                       Confirm Changes
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
