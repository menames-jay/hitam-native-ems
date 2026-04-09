import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export default function Page() {
  return (
    <ModulePlaceholder 
      title="My Registrations"
      description="Track your enrollment across all institutional workshops, seminars, and technical events."
      icon="app_registration"
      themeColor="text-[#2E7D32]"
      accentBg="bg-[#2E7D32]"
      role="Student"
    />
  );
}
