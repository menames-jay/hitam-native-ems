import { ApprovalCenter } from "@/components/dashboard/ApprovalCenter";

export default function Page() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Approvals</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Review and authorize attendance submissions for your department sessions.
        </p>
      </header>
      
      <ApprovalCenter 
        role="PROGRAM_HEAD"
        themeColor="text-[#6366f1]"
        bgAccent="bg-[#6366f1]"
      />
    </div>
  );
}
