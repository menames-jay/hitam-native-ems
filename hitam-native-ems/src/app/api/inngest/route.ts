import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { enforce14DayRule, eventReminders } from "@/lib/inngest/functions";

// The serve function sets up the API route for Inngest to communicate with
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    enforce14DayRule,
    eventReminders
  ],
});
