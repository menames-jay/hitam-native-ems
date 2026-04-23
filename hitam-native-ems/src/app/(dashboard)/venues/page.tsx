import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/role";

export default async function VenuesPortalPage() {
  const session = await getServerSession();
  if (!session || (session.user.role !== 'AO' && session.user.role !== 'ADMIN')) {
    redirect("/dashboard");
  }
  
  redirect("/venues/queue");
}
