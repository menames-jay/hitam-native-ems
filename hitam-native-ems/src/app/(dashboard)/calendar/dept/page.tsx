import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export default function Page() {
  return (
    <ModulePlaceholder 
      title="Department Calendar"
      description="Centralized schedule for all departmental sessions and events."
      icon="calendar_view_day"
      themeColor="text-[#6366f1]"
      accentBg="bg-[#6366f1]"
      role="Program Head"
    />
  );
}
