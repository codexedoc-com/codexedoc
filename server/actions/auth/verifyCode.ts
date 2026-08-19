"use server";

import { MAX_VERIFY_ATTEMPTS } from "./constants";
import { hashCode } from "./utils";
import { activeVerifications } from "./verificationStore";
import { serverAuth } from "@/lib/auth/gateway/serverAuth";
import type { AuthUser } from "@/lib/auth/types";
import { authenticateMockUser } from "@/server/mockData";

export async function verifyCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const code = formData.get("verificationCode")?.toString().trim();
  const submittedUsername = formData.get("username")?.toString().trim();

  // ====================
  // BASIC VALIDATION
  // ====================
  if (!email || !code) {
    throw new Error("Email and code are required");
  }

  const isCommunityMode = process.env.USE_AUTH !== "true";

  // ====================
  // COMMUNITY MODE
  // ====================
  if (isCommunityMode) {
    if (code.length < 4) {
      throw new Error("Please enter the verification code");
    }

    authenticateMockUser(email, submittedUsername || undefined);

    const devUser: AuthUser = {
      id: "mock-user",
      email,
      name: submittedUsername || "Mock Learner",
      role: "community_contributor",
    };

    await serverAuth.createSession(devUser);

    return {
      success: true,
      message: "Logged in successfully!",
      userId: devUser.id,
      username: devUser.name,
      email: devUser.email,
      isNewUser: false,
    };
  }

  // ====================
  // PRODUCTION MODE VERIFICATION
  // ====================
  const existingVerification = activeVerifications.get(email);

  if (!existingVerification) {
    throw new Error("No verification request found. Please request a new code.");
  }

  // EXPIRED CODE
  if (existingVerification.expiresAt < new Date()) {
    activeVerifications.delete(email);
    throw new Error("Code has expired. Please request a new one.");
  }

  // TOO MANY ATTEMPTS
  if (existingVerification.attempts >= MAX_VERIFY_ATTEMPTS) {
    activeVerifications.delete(email);
    throw new Error("Too many failed attempts. Please request a new code.");
  }

  // VERIFY CODE HASH
  const codeHash = hashCode(code);
  if (codeHash !== existingVerification.codeHash) {
    existingVerification.attempts += 1;
    throw new Error("Invalid verification code");
  }

  // RESOLVE USER AND CREATE ADR-002 SESSION
  const username = submittedUsername || existingVerification.username || email.split("@")[0] || "User";
  const user: AuthUser = {
    id: `prod-user-${Buffer.from(email).toString("hex").slice(0, 12)}`,
    email,
    name: username,
    role: "core_contributor",
  };

  // Create session in sessionStore and set HTTP-only cookie
  await serverAuth.createSession(user);

  // Cleanup verification record
  activeVerifications.delete(email);

  return {
    success: true,
    message: "Logged in successfully!",
    userId: user.id,
    username: user.name,
    email: user.email,
    isNewUser: false,
  };
}