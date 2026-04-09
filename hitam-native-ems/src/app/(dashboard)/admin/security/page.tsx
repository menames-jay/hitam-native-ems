import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export default function Page() {
  return (
    <ModulePlaceholder 
      title="System Security"
      description="Manage platform integrity, access logs, and security protocols."
      icon="security"
      themeColor="text-[#0f172a]"
      accentBg="bg-[#0f172a]"
      role="Super Admin"
    />
  );
}
