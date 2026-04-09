"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setDevRoleAction(role: string | null) {
  const cookieStore = await cookies();
  if (role) {
    cookieStore.set("ems-role", role, { path: "/" });
  } else {
    cookieStore.delete("ems-role");
  }
  revalidatePath("/");
  return { success: true };
}
