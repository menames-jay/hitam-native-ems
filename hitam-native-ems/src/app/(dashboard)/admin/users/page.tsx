import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export default function Page() {
  return (
    <ModulePlaceholder 
      title="User Management"
      description="System-wide user administration, role assignment, and access control."
      icon="person_search"
      themeColor="text-[#0f172a]"
      accentBg="bg-[#0f172a]"
      role="Super Admin"
    />
  );
}
