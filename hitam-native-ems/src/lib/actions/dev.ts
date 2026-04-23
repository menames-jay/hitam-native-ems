"use server";

import { inngest } from "@/lib/inngest/client";
import { getServerSession } from "@/lib/auth/role";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Institutional Dev Tool: Direct role switching for testing.
 * Sets a secure institutional cookie to override the current session role.
 */
export async function setDevRoleAction(role: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("ems-role", role, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/approvals");
    return { success: true };
  } catch (error) {
    console.error("Failed to set dev role:", error);
    return { success: false };
  }
}

/**
 * Institutional Dev Tool: Manually trigger the event reminder logic.
 */
export async function triggerRemindersAction() {
  const session = await getServerSession();
  
  // Only allow Admin or Staff roles to trigger manually
  if (!session || !['ADMIN', 'AO', 'LEAD_SE'].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  await inngest.send({
    name: "dev/trigger-reminders",
    data: {
      triggeredBy: session.user.id,
      timestamp: new Date().toISOString()
    }
  });

  return { success: true };
}
