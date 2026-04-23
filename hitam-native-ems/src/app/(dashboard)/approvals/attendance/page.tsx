import { AttendanceApprovalCenter } from "@/components/attendance/attendance-approval-center";

export default function Page() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Attendance Approvals</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Review and authorize attendance snapshots for your department sessions. This syncs the event data with the institutional ERP ledger.
        </p>
      </header>
      
      <AttendanceApprovalCenter />
    </div>
  );
}
