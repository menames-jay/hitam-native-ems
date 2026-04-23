import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification
    }
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      const { sendPasswordResetEmail } = await import("@/lib/services/email-service");
      await sendPasswordResetEmail(user.email, url);
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Automated Whitelisting logic
          // Student roll numbers start with 2 digits (e.g. 21X41A0501@hitam.org)
          // Faculty emails start with letters (e.g. aparnag.cse@hitam.org)
          const email = user.email.toLowerCase();
          const isStudent = /^\d{2}/.test(email);
          
          return {
            data: {
              ...user,
              emailVerified: true, // Automatically verify institutional emails
              role: isStudent ? "STUDENT" : "FACULTY"
            }
          };
        }
      }
    }
  },
  // ADDED FAIL-SAFE: Re-verify role after creation
  events: {
    user: {
      created: async ({ user }: { user: any }) => {
        const email = user.email.toLowerCase();
        const isStudent = /^\d{2}/.test(email);
        const expectedRole = isStudent ? "STUDENT" : "FACULTY";
        
        // Final fallback to ensure role and verification are correct in DB
        if (user.role !== expectedRole || !user.emailVerified) {
          await db.update(schema.user)
            .set({ 
              role: expectedRole,
              emailVerified: true 
            })
            .where(eq(schema.user.id, user.id));
        }
      }
    }
  },
  plugins: [],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "STUDENT",
      },
      departmentId: {
        type: "string",
        required: false,
      },
    },
  },
});

