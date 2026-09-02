import { CODE_EXPIRY_MINUTES } from "./constants";
import { Resend } from "resend";

export async function sendVerificationEmail(
  email: string,
  code: string
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  // Fallback to console logging if Resend API Key is missing or empty
  if (!apiKey || apiKey === "your_resend_api_key_here") {
    console.log(`\n======================================================`);
    console.log(`[CODEXEDOC AUTH] Verification code for ${email}: ${code}`);
    console.log(`======================================================\n`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "CODEXEDOC <verify@codexedoc.com>",
      replyTo: "contact@codexedoc.com",
      to: email,
      subject: "CODEXEDOC Verification Code",
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e4e4e7; border-radius: 16px;">
          <h2 style="color: #09090b; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Your Verification Code</h2>
          <p style="color: #71717a; font-size: 14px; margin-bottom: 24px;">Use this 6-digit code to access your CODEXEDOC account.</p>
          <div style="font-size: 36px; letter-spacing: 6px; font-weight: 800; color: #4f46e5; margin: 24px 0; padding: 16px; background: #f4f4f5; border-radius: 12px; text-align: center;">
            ${code}
          </div>
          <p style="color: #a1a1aa; font-size: 12px;">This code will expire in ${CODE_EXPIRY_MINUTES} minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Resend API Email error:", error);
    console.log(`[FALLBACK] Verification code for ${email}: ${code}`);
  }
}