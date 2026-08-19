"use server";

import { Resend } from "resend";
import { CODE_EXPIRY_MINUTES } from "./constants";

/**
 * Send a verification code email using Resend if configured,
 * or log the code in development/Community Mode.
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey || process.env.USE_AUTH !== "true") {
    console.log(`[AUTH] Verification code for ${email}: ${code} (expires in ${CODE_EXPIRY_MINUTES}m)`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "CODEXEDOC <verify@codexedoc.com>",
      replyTo: "contact@codexedoc.com",
      to: email,
      subject: "CODEXEDOC Verification",
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
          <h2>Your verification code</h2>
          <div
            style="
              font-size: 42px;
              letter-spacing: 8px;
              font-weight: bold;
              color: #111827;
              margin: 24px 0;
            "
          >
            ${code}
          </div>
          <p>
            This code will expire in ${CODE_EXPIRY_MINUTES} minutes.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send verification email. Please try again.");
  }
}
