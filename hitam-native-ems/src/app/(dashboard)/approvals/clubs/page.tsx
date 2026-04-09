import { ApprovalCenter } from "@/components/dashboard/ApprovalCenter";

export default function Page() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Club Governance</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Review club activity proposals and engagement strategies. Budget and theme check required.
        </p>
      </header>
      
      <ApprovalCenter 
        role="LEAD_SE"
        themeColor="text-[#f59e0b]"
        bgAccent="bg-[#f59e0b]"
      />
    </div>
  );
}
