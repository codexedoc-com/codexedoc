"use server";

import { validateEmail, validateUsername } from "./validations";
import { verifyTurnstile } from "./turnstile";
import { generateVerificationCode, hashCode } from "./utils";
import { sendVerificationEmail } from "./email";
import { CODE_EXPIRY_MINUTES, RESEND_COOLDOWN_SECONDS } from "./constants";
import { authenticateMockUser } from "@/server/mockData";

import { activeVerifications } from "./verificationStore";

export async function sendVerificationCode(formData: FormData) {
  // ====================
  // FORM DATA
  // ====================
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const username = formData.get("username")?.toString().trim();
  const mode = formData.get("mode")?.toString() || "register";

  // ====================
  // HONEYPOT PROTECTION
  // ====================
  const honeypot = formData.get("contact_field")?.toString() || formData.get("honeypot")?.toString();
  if (honeypot) {
    throw new Error("Invalid request");
  }

  // ====================
  // VALIDATION
  // ====================
  validateEmail(email);

  if (mode === "register") {
    validateUsername(username);
  }

  // ====================
  // TURNSTILE VERIFICATION
  // ====================
  const turnstileToken = formData.get("cf-turnstile-response")?.toString();
  await verifyTurnstile(turnstileToken);

  // ====================
  // COMMUNITY MODE SHORT-CIRCUIT
  // ====================
  const isCommunityMode = process.env.USE_AUTH !== "true";
  if (isCommunityMode) {
    authenticateMockUser(email!, username || undefined);
    return {
      success: true,
      message: "Mock verification code sent. Use any 6-digit code to continue.",
    };
  }

  // ====================
  // RATE LIMITING & COOLDOWN (PRODUCTION)
  // ====================
  const now = new Date();
  const existing = activeVerifications.get(email!);

  if (existing?.lastSentAt) {
    const secondsSinceLastSend = (now.getTime() - existing.lastSentAt.getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
      throw new Error(`Please wait ${waitTime}s before requesting another code`);
    }
  }

  // ====================
  // GENERATE CODE & STORE
  // ====================
  const code = generateVerificationCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000);

  activeVerifications.set(email!, {
    email: email!,
    username: mode === "register" ? username : existing?.username,
    codeHash,
    attempts: 0,
    lastSentAt: now,
    expiresAt,
  });

  // ====================
  // SEND EMAIL
  // ====================
  await sendVerificationEmail(email!, code);

  return {
    success: true,
    message: "Verification code sent to your email.",
  };
}
