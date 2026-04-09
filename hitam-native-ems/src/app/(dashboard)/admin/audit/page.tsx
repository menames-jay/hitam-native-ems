import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export default function Page() {
  return (
    <ModulePlaceholder 
      title="Audit Trail"
      description="Immutable ledger of all institutional governance actions and system logs."
      icon="receipt_long"
      themeColor="text-[#0f172a]"
      accentBg="bg-[#0f172a]"
      role="Super Admin"
    />
  );
}
