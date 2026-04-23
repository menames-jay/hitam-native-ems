import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_123");
const FROM_EMAIL = "HITAM EMS <noreply@hitam.org>";

/**
 * Institutional Communications: Notify student of successful registration
 */
export async function sendRegistrationEmail(to: string, eventTitle: string, date: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Registration Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 40px; color: #334155;">
          <h1 style="color: #0f172a; letter-spacing: -0.05em; font-weight: 900; text-transform: uppercase;">Confirmed.</h1>
          <p style="font-weight: 500; font-size: 16px;">You have officially registered for <strong>${eventTitle}</strong>.</p>
          <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0;">
             <p style="margin: 0; font-size: 12px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.2em;">Event Date</p>
             <p style="margin: 5px 0 0 0; font-weight: 700; color: #1e293b;">${date}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Please present your digital registration on the dashboard for session check-in.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Email registration error:", error);
    return { success: false };
  }
}

/**
 * Institutional Communications: Acknowledgement & Badge Issuance
 */
export async function sendBadgeEmail(to: string, eventTitle: string, credentialHash: string) {
  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify/badge/${credentialHash}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Credential Issued: ${eventTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 40px; color: #334155; text-align: center;">
          <h2 style="color: #10b981; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;">Digital Badge Issued</h2>
          <h1 style="color: #0f172a; font-size: 32px; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 20px;">${eventTitle}</h1>
          
          <div style="display: inline-block; padding: 40px; background: #f0fdf4; border: 2px solid #10b981; border-radius: 40px; margin: 20px 0;">
             <span style="font-size: 48px;">🏆</span>
             <p style="margin-top: 15px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Verified Participant</p>
          </div>

          <p style="font-weight: 500; color: #64748b; max-width: 300px; margin: 0 auto 30px auto;">Your institutional participation has been verified and signed cryptographically.</p>
          
          <a href="${verifyLink}" style="display: inline-block; background: #0f172a; color: white; padding: 18px 40px; border-radius: 20px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Verify Credential</a>
          
          <p style="margin-top: 40px; font-size: 10px; color: #cbd5e1; font-family: monospace;">SIG: ${credentialHash.substring(0, 16)}...</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Email badge error:", error);
    return { success: false };
  }
}

/**
 * Institutional Communications: Password Reset
 */
export async function sendPasswordResetEmail(to: string, url: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Security: Institutional Password Reset",
      html: `
        <div style="font-family: sans-serif; padding: 40px; color: #334155;">
          <h1 style="color: #0f172a; letter-spacing: -0.05em; font-weight: 900; text-transform: uppercase;">Recovery.</h1>
          <p style="font-weight: 500; font-size: 16px;">We received a request to reset your HITAM EMS password.</p>
          <a href="${url}" style="display: inline-block; background: #0f172a; color: white; padding: 18px 40px; border-radius: 20px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; margin-top: 20px;">Reset Password</a>
          <p style="margin-top: 30px; font-size: 12px; color: #94a3b8;">If you did not request this, please ignore this email or contact the institutional Admin.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Email reset error:", error);
    return { success: false };
  }
}
