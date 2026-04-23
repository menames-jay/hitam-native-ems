import { createHmac } from "crypto";

const SECRET = process.env.INSTITUTIONAL_BADGE_SECRET || "hitam-ems-secure-master-key-2026";

/**
 * Institutional Governance: Generate a unique signature for a participaton record
 */
export function generateBadgeHash(studentId: string, eventId: string, timestamp: Date | string) {
  const ts = typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
  const data = `${studentId}:${eventId}:${ts}`;
  
  return createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");
}

/**
 * Verify if a provided signature is authentic for the given record data
 */
export function verifyBadgeHash(studentId: string, eventId: string, timestamp: Date | string, signature: string) {
  const ts = typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
  const expected = generateBadgeHash(studentId, eventId, ts);
  return expected === signature;
}
