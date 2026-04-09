import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export default function Page() {
  return (
    <ModulePlaceholder 
      title="Event Analytics"
      description="Detailed metrics on student engagement, registration trends, and club performance."
      icon="analytics"
      themeColor="text-[#10b981]"
      accentBg="bg-[#10b981]"
      role="Club Coordinator"
    />
  );
}
