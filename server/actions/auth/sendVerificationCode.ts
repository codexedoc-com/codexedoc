"use server";

import { validateEmail, validateUsername } from "./validations";
import { verifyTurnstile } from "./turnstile";
import { generateVerificationCode, hashCode } from "./utils";
import { sendVerificationEmail } from "./email";
import { CODE_EXPIRY_MINUTES, RESEND_COOLDOWN_SECONDS } from "./constants";
import { authenticateMockUser } from "@/server/mockData";
import {
  getVerification,
  saveVerification,
} from "./verificationStore";
import { getDb, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export async function sendVerificationCode(formData: FormData) {
  // ====================
  // FORM DATA
  // ====================
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const rawUsername = formData.get("username")?.toString().trim();
  const username = rawUsername || undefined;
  const mode = formData.get("mode")?.toString() || "register";

  // ====================
  // HONEYPOT PROTECTION
  // ====================
  const honeypot =
    formData.get("contact_field")?.toString() ||
    formData.get("honeypot")?.toString();
  if (honeypot) {
    throw new Error("Invalid request");
  }

  // ====================
  // BASIC VALIDATION
  // ====================
  validateEmail(email);

  if (mode === "register") {
    validateUsername(username);
  }

  const isCommunityMode = process.env.USE_AUTH !== "true";
  const hasDb = Boolean(process.env.DATABASE_URL);

  // ====================
  // USERNAME & EMAIL UNIQUENESS CHECKS (PRODUCTION MODE)
  // ====================
  if (!isCommunityMode && hasDb) {
    const db = getDb();

    if (mode === "register") {
      // 1. Check if username is already taken (case-insensitive)
      const normalizedUsername = username!.toLowerCase();
      const existingUsername = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(
          eq(sql`LOWER((${schema.users.username})::text)`, normalizedUsername)
        )
        .limit(1);

      if (existingUsername && existingUsername.length > 0) {
        throw new Error("Username is already taken. Please choose another.");
      }

      // 2. Check if email is already registered (case-insensitive)
      const existingEmail = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(sql`LOWER(${schema.users.email})`, email!))
        .limit(1);

      if (existingEmail && existingEmail.length > 0) {
        throw new Error(
          "An account with this email already exists. Please switch to login."
        );
      }
    } else if (mode === "login") {
      // Check if account exists
      const existingEmail = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(sql`LOWER(${schema.users.email})`, email!))
        .limit(1);

      if (!existingEmail || existingEmail.length === 0) {
        throw new Error(
          "No account found with this email. Please create an account first."
        );
      }
    }
  }

  // ====================
  // TURNSTILE VERIFICATION
  // ====================
  const turnstileToken = formData.get("cf-turnstile-response")?.toString();
  const clientIp = await verifyTurnstile(turnstileToken);

  // ====================
  // COMMUNITY MODE SHORT-CIRCUIT
  // ====================
  if (isCommunityMode) {
    authenticateMockUser(email!, username);
    return {
      success: true,
      message: "Mock verification code sent. Use any 6-digit code to continue.",
    };
  }

  // ====================
  // RATE LIMITING & COOLDOWN (PRODUCTION)
  // ====================
  const now = new Date();
  const existing = await getVerification(email!);

  if (existing?.lastSentAt) {
    const secondsSinceLastSend =
      (now.getTime() - new Date(existing.lastSentAt).getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(
        RESEND_COOLDOWN_SECONDS - secondsSinceLastSend
      );
      throw new Error(`Please wait ${waitTime}s before requesting another code`);
    }
  }

  // ====================
  // GENERATE CODE & STORE PERSISTENTLY
  // ====================
  const code = generateVerificationCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(
    now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000
  );

  await saveVerification({
    email: email!,
    username: mode === "register" ? username : existing?.username,
    codeHash,
    attempts: 0,
    lastSentAt: now,
    expiresAt,
    ipAddress: clientIp,
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
