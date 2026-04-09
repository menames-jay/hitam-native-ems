import { ApprovalCenter } from "@/components/dashboard/ApprovalCenter";

export default function Page() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Venue Allocation Support</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Review and manage institutional venue requests for confirmed events. Logistics and feasibility check.
        </p>
      </header>
      
      <ApprovalCenter 
        role="AO"
        themeColor="text-[#8b5cf6]"
        bgAccent="bg-[#8b5cf6]"
      />
    </div>
  );
}
