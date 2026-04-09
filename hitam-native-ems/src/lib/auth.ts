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
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      // Log the reset URL to terminal instead of emailing for now
      console.log(`\n\n=== PASSWORD RESET REQUEST ===`);
      console.log(`User: ${user.email}`);
      console.log(`Reset Link: ${url}`);
      console.log(`==============================\n\n`);
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
          
          if (!isStudent) {
            return {
              data: {
                ...user,
                role: "FACULTY"
              }
            };
          }
          // Explicitly set STUDENT for digits to be safe
          return {
            data: {
              ...user,
              role: "STUDENT"
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
        
        // Final fallback to ensure role is in DB
        if (!isStudent && user.role !== "FACULTY") {
          await db.update(schema.user)
            .set({ role: "FACULTY" })
            .where(eq(schema.user.id, user.id));
        } else if (isStudent && user.role !== "STUDENT") {
          await db.update(schema.user)
            .set({ role: "STUDENT" })
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

