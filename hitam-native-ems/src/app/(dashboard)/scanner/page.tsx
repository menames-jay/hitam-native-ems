import { QRScanner } from "@/components/events/QRScanner";
import { getServerSession } from "@/lib/auth/role";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ sessionId?: string }>
}) {
  const session = await getServerSession();
  const { sessionId } = await searchParams;

  if (!session) redirect("/login");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-8">
      <QRScanner studentId={session.user.id} sessionId={sessionId} />
    </div>
  );
}
