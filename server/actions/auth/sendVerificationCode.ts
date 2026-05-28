"use server";

import { and, eq, gt } from "drizzle-orm";

import { db } from "@/server/db/db";
import {
  users,
  verificationCodes,
} from "@/server/db/schema";

import {
  CODE_EXPIRY_MINUTES,
  MAX_SENDS_PER_HOUR,
  MAX_SENDS_PER_IP_PER_HOUR,
  RESEND_COOLDOWN_SECONDS,
} from "./constants";

import {
  generateVerificationCode,
  hashCode,
} from "./utils";

import {
  validateEmail,
  validateUsername,
} from "./validations";

import { verifyTurnstile } from "./turnstile";

import { sendVerificationEmail } from "./email";

export async function sendVerificationCode(formData: FormData) {
  // ====================
  // FORM DATA
  // ====================

  const email = formData
    .get("email")
    ?.toString()
    .trim()
    .toLowerCase();

  const username = formData
    .get("username")
    ?.toString()
    .trim();

  const mode = formData.get("mode")?.toString() || "register";

  // ====================
  // HONEYPOT PROTECTION
  // ====================

  const honeypot = formData.get("honeypot")?.toString();
  if (honeypot) {
    throw new Error("Invalid request");
  }

  // ====================
  // VALIDATION
  // ====================

  validateEmail(email);

  if (mode === "register") {
    await validateUsername(username);
  }

  // ====================
  // TURNSTILE VERIFICATION
  // ====================

  const turnstileToken = formData.get("cf-turnstile-response")?.toString();
  const ipAddress = await verifyTurnstile(turnstileToken);

  // ====================
  // CHECK USER EXISTENCE
  // ====================

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email!),
  });

  if (mode === "register" && existingUser) {
    throw new Error("An account with this email already exists. Please login instead.");
  }

  if (mode === "login" && !existingUser) {
    throw new Error("No account found with this email. Please register first.");
  }

  // ====================
  // RATE LIMITING
  // ====================

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // IP RATE LIMIT
  const ipRequests = await db.query.verificationCodes.findMany({
    where: and(
      eq(verificationCodes.ipAddress, ipAddress),
      gt(verificationCodes.createdAt, oneHourAgo)
    ),
  });

  const totalIpSends = ipRequests.reduce((sum, record) => sum + record.sendCount, 0);

  if (totalIpSends >= MAX_SENDS_PER_IP_PER_HOUR) {
    throw new Error("Too many verification requests from this IP. Please try again later.");
  }

  // EMAIL RATE LIMIT
  const recentEmailActivity = await db.query.verificationCodes.findMany({
    where: and(
      eq(verificationCodes.email, email!),
      gt(verificationCodes.createdAt, oneHourAgo)
    ),
  });

  const totalEmailSendsThisHour = recentEmailActivity.reduce(
    (sum, record) => sum + record.sendCount,
    0
  );

  if (totalEmailSendsThisHour >= MAX_SENDS_PER_HOUR) {
    throw new Error("Too many verification requests. Try again later.");
  }

  // ====================
  // EXISTING VERIFICATION + CLEANUP
  // ====================

  let verification = await db.query.verificationCodes.findFirst({
    where: eq(verificationCodes.email, email!),
  });

  // Clean up only very old records (older than 1 hour)
  if (verification && verification.createdAt < oneHourAgo) {
    await db.delete(verificationCodes).where(eq(verificationCodes.email, email!));
    verification = undefined;
  }

  // ====================
  // RESEND COOLDOWN
  // ====================

  if (verification?.lastSentAt) {
    const secondsSinceLastSend =
      (now.getTime() - verification.lastSentAt.getTime()) / 1000;

    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
      throw new Error(`Please wait ${waitTime}s before requesting another code`);
    }
  }

  // ====================
  // DETERMINE SEND COUNT
  // ====================

  const isNewHourSession = !verification || verification.createdAt < oneHourAgo;
  const sendCount = isNewHourSession ? 1 : verification!.sendCount + 1;

  // ====================
  // GENERATE CODE
  // ====================

  const code = generateVerificationCode();
  const codeHash = hashCode(code);

  const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000);

  // ====================
  // SAVE VERIFICATION RECORD
  // ====================

  if (verification) {
    await db
      .update(verificationCodes)
      .set({
        username: mode === "register" ? username : verification.username,
        codeHash,
        attempts: 0,
        sendCount,
        ipAddress,
        lastSentAt: now,
        expiresAt,
        createdAt: isNewHourSession ? now : verification.createdAt,
      })
      .where(eq(verificationCodes.email, email!));
  } else {
    await db.insert(verificationCodes).values({
      email: email!,
      username: mode === "register" ? username! : "",
      codeHash,
      attempts: 0,
      sendCount: 1,
      ipAddress,
      lastSentAt: now,
      expiresAt,
      createdAt: now,
    });
  }

  // ====================
  // SEND EMAIL
  // ====================

  await sendVerificationEmail(email!, code);

  return {
    success: true,
    message: "Code sent",
  };
}