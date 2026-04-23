import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyBadgeHash } from "@/lib/services/credential-service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function VerifyBadgePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // 1. Fetch the participation record with institutional relations
  const record = await db.query.attendanceRecords.findFirst({
    where: eq(schema.attendanceRecords.id, id),
    with: {
      student: true,
      eventSession: {
        with: {
          event: true
        }
      }
    }
  });

  // Strict null-guards for data integrity and typing
  if (!record || !record.credentialHash || !record.student || !record.eventSession?.event) {
    notFound();
  }

  // 2. Verify the institutional signature
  const isValid = verifyBadgeHash(
    record.studentId,
    record.eventSession.eventId,
    record.scannedAt,
    record.credentialHash
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#020617] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Verification Shield HUD */}
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Certificate Card: High Fidelity Institutional Aesthetic */}
        <div className="bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden text-center group">
          
          {/* Integrity Ribbon */}
          <div className={cn(
             "absolute top-0 right-0 px-10 py-2 -mr-10 mt-8 rotate-45 text-[10px] font-black uppercase tracking-[0.2em] transform origin-bottom-right shadow-lg transition-colors duration-500",
             isValid ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          )}>
            {isValid ? "Authentic Record" : "Invalid Signature"}
          </div>

          <div className="space-y-8">
             <div className="flex justify-center">
                <div className={cn(
                   "w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3",
                   isValid ? "bg-emerald-600 shadow-emerald-200/50 dark:shadow-none" : "bg-red-100"
                )}>
                   <span className="material-symbols-outlined text-white text-5xl">
                      {isValid ? 'verified' : 'report'}
                   </span>
                </div>
             </div>

             <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Institutional Credential</span>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic uppercase">
                   {record.eventSession.event.title}
                </h1>
             </div>

             <div className="py-8 border-y-2 border-slate-50 dark:border-white/5 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Issued To</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{record.student.name || 'Anonymous Student'}</p>
                <p className="text-[10px] font-mono text-slate-400 opacity-60 tracking-widest">{record.student.rollNumber || 'HITAM-EM-USER'}</p>
             </div>

             <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border border-transparent group-hover:border-slate-100 dark:group-hover:border-white/10 transition-colors">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                   <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                     {format(record.scannedAt, "MMM dd, yyyy")}
                   </p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl border border-transparent group-hover:border-slate-100 dark:group-hover:border-white/10 transition-colors">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                   <p className="text-xs font-black text-emerald-600 uppercase tracking-tight">Verified</p>
                </div>
             </div>

             <div className="pt-6">
                <p className="text-[10px] text-slate-300 font-mono break-all line-clamp-2 select-all cursor-pointer hover:text-slate-500 transition-colors">
                   SIG: {record.credentialHash}
                </p>
             </div>
          </div>
        </div>

        {/* Institutional Handoff */}
        <div className="mt-12 text-center space-y-6">
           <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">corporate_fare</span>
              HITAM EMS Governance Portal
           </Link>
           <p className="text-[9px] text-slate-400 font-medium max-w-xs mx-auto leading-relaxed opacity-60">
             This digital record is cryptographically signed and stored in the HITAM institutional ledger. 
             Tampering with this record is a violation of student engagement policy.
           </p>
        </div>
      </div>
    </div>
  );
}
