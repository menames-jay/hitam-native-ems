import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Centrally retrieves the current user's role, including the developer bypass.
 * Uses React 'cache' to ensure only one session/DB check per request.
 * 
 * IMPORTANT: To remove the developer role bypass, simply set 'ALLOW_DEV_BYPASS' to false.
 */
export const getServerRole = cache(async () => {
  const ALLOW_DEV_BYPASS = true; // Set to false to disable x-ems-role header bypass

  const headersList = await headers();

  // 1. Check for Developer Bypass (Development only)
  if (ALLOW_DEV_BYPASS && process.env.NODE_ENV === "development") {
    const cookieStore = await (await import('next/headers')).cookies();
    const cookieRole = cookieStore.get("ems-role")?.value;
    const devRole = headersList.get("x-ems-role") || cookieRole;
    if (devRole) return devRole.toUpperCase();
  }

  // 2. Fetch Session
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) return null;

  // 3. Fetch Fresh User Data (to ensure role is current)
  const freshUser = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  });

  return freshUser?.role || "STUDENT";
});

const DEV_NAMES: Record<string, string> = {
  STUDENT: "Dev Varma",
  STUDENT_COORDINATOR: "Anjali Raman",
  FACULTY: "Parvathi Devi",
  PROGRAM_HEAD: " Dr. Keshava Murthy",
  HOD: "Dr. Rama Reddy",
  LEAD_SE: "Bhanu Srinivas",
  AO: "Aditya Tej",
  ADMIN: "System Administrator",
};

/**
 * Maps institutional roles to REAL database IDs and emails for testing.
 */
const INSTITUTIONAL_ACCOUNTS: Record<string, { id: string, email: string }> = {
  STUDENT: { id: "8JM0xO6btImJLGa3h5tupIWS3YvAJg3T", email: "22e51a6938@hitam.org" },
  STUDENT_COORDINATOR: { id: "UaVeWgGttmoYFWGJotlr2NrIt2feUwnI", email: "22e51a6903@hitam.org" },
  FACULTY: { id: "hm4JLIWK17hu32Xz8Ab7Bhz2MghFWfmx", email: "faculty.cse@hitam.org" },
  PROGRAM_HEAD: { id: "P0WGEPhrrtfM8mZTurhwAttZO0rKEpja", email: "programhead.cse@hitam.org" },
  HOD: { id: "SWBQSv0dujR966DXZqdeIOv972Ks61Gh", email: "johndoe.cse@hitam.org" },
  LEAD_SE: { id: "gz6LLoPE5jTPgHyOzES9ucTc4u9aMmQr", email: "lead.se@hitam.org" },
  AO: { id: "OymvKQVo7RKaHhhPlao0tDGcAKH9LbsA", email: "admin.officer@hitam.org" },
  ADMIN: { id: "xOmhhFR62J4PXrMAjxarFMgJsxzIqeJ6", email: "super.admin@hitam.org" },
};

/**
 * Returns full session data and role in a single cached call.
 */
export const getServerSession = cache(async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Calculate role and mock data for dev mode
  const ALLOW_DEV_BYPASS = true;
  const isDev = process.env.NODE_ENV === "development";
  const cookieStore = await (await import('next/headers')).cookies();
  const cookieRole = cookieStore.get("ems-role")?.value;
  const devRole = (headersList.get("x-ems-role") || cookieRole)?.toUpperCase();

  if (ALLOW_DEV_BYPASS && isDev && devRole && INSTITUTIONAL_ACCOUNTS[devRole]) {
    const account = INSTITUTIONAL_ACCOUNTS[devRole];

    return {
      session: {
        id: `dev-session-${devRole}`,
        userId: account.id,
        expiresAt: new Date(Date.now() + 86400000)
      },
      user: {
        id: account.id,
        name: DEV_NAMES[devRole] || "Dev User",
        email: account.email,
        role: devRole,
        departmentId: "dept_cse", // Default dev department to prevent Drizzle undefined crashes
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } as any;
  }

  if (!session) return null;

  const freshUser = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  });

  return {
    ...session,
    user: {
      ...session.user,
      ...freshUser,
      role: freshUser?.role || "STUDENT"
    }
  };
});
