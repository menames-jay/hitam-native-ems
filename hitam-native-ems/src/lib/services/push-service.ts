import webpush from 'web-push';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Configuration
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || "BM2bCoaHOuTXbJs3o8m25OxGDV6arWeSrQkaQEpNTkBhgqltAS7IU4ml0vUdkvjY7jcr1y4qAdQxUYiXLM10ZGs",
  privateKey: process.env.VAPID_PRIVATE_KEY || "BAy3bXRWX0LtfDpM7novp_y5ZJB4r38pbocHw9tr0Hw",
};

webpush.setVapidDetails(
  'mailto:support@hitam.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

/**
 * Sends a push notification to all subscriptions of a specific user.
 */
export async function sendPushNotification(userId: string, title: string, message: string, url: string = "/") {
  try {
    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: eq(schema.pushSubscriptions.userId, userId),
    });

    if (subscriptions.length === 0) return { success: false, error: "No subscriptions found" };

    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/icon.png", // Ensure this exists in public/
      data: { url }
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub => 
        webpush.sendNotification(sub.subscription as any, payload)
      )
    );

    // Optional: Cleanup expired subscriptions (410 Gone or 404 Not Found)
    // For now, just log results
    console.log(`Push sent to user ${userId}:`, results);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return { success: false, error: (error as Error).message };
  }
}
