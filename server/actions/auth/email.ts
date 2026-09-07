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
  const isEnforcedAuth = process.env.USE_AUTH === "true";
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const isPlaceholderKey =
    !apiKey ||
    apiKey.includes("placeholder") ||
    apiKey.startsWith("your-") ||
    apiKey.startsWith("re_your_");

  // Community / Local Development Mode: allow zero-dependency operation
  if (!isEnforcedAuth) {
    console.log(
      `[AUTH:CommunityMode] Verification code for ${email}: ${code} (expires in ${CODE_EXPIRY_MINUTES}m)`
    );
    return;
  }

  // Production Mode: email service is mandatory
  if (isPlaceholderKey) {
    console.error("[Email] RESEND_API_KEY is missing or invalid in Production Mode.");
    throw new Error("Email service is not configured. Please contact support.");
  }

  const fromAddress =
    process.env.EMAIL_FROM?.trim() || "CODEXEDOC <verify@codexedoc.com>";

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromAddress,
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

    if (result.error) {
      console.error("[Email] Resend API error:", result.error.message || result.error.name);
      throw new Error("Failed to send verification email. Please try again.");
    }
  } catch (error) {
    if (error instanceof Error && (error.message.includes("configured") || error.message.includes("verification email"))) {
      throw error;
    }
    console.error("[Email] Error dispatching email:", error);
    throw new Error("Failed to send verification email. Please try again.");
  }
}
