import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/role";

export default async function AdminPortalPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== 'ADMIN') redirect("/dashboard");
  
  // AO and Admin typically go straight to the queue/users
  redirect("/admin/users");
}
