"use server";

import { MAX_VERIFY_ATTEMPTS } from "./constants";
import { hashCode } from "./utils";
import {
  getVerification,
  incrementAttempts,
  deleteVerification,
} from "./verificationStore";
import { serverAuth } from "@/lib/auth/gateway/serverAuth";
import type { AuthUser, AuthRole } from "@/lib/auth/types";
import { authenticateMockUser } from "@/server/mockData";
import { getDb, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

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
  const existingVerification = await getVerification(email);

  if (!existingVerification) {
    throw new Error(
      "No verification request found. Please request a new code."
    );
  }

  const now = new Date();
  const expiresAt = new Date(existingVerification.expiresAt);

  // EXPIRED CODE
  if (expiresAt < now) {
    await deleteVerification(email);
    throw new Error("Code has expired. Please request a new one.");
  }

  // TOO MANY ATTEMPTS
  if (existingVerification.attempts >= MAX_VERIFY_ATTEMPTS) {
    await deleteVerification(email);
    throw new Error("Too many failed attempts. Please request a new code.");
  }

  // VERIFY CODE HASH
  const codeHash = hashCode(code);
  if (codeHash !== existingVerification.codeHash) {
    await incrementAttempts(email);
    throw new Error("Invalid verification code");
  }

  // ====================
  // PERSIST / RESOLVE USER IDENTITY IN DATABASE
  // ====================
  let user: AuthUser;
  let isNewUser = false;

  const hasDb = Boolean(process.env.DATABASE_URL);

  if (hasDb) {
    const db = getDb();

    // 1. Check if user already exists
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(eq(sql`LOWER(${schema.users.email})`, email))
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      const existingUserRow = existingUsers[0];
      user = {
        id: existingUserRow.id,
        email: existingUserRow.email,
        name: existingUserRow.username,
        role: (existingUserRow.role as AuthRole) || "core_contributor",
      };
    } else {
      // 2. New user registration
      isNewUser = true;
      const usernameToUse =
        submittedUsername ||
        existingVerification.username ||
        email.split("@")[0] ||
        "Learner";

      try {
        const createdUsers = await db
          .insert(schema.users)
          .values({
            email,
            username: usernameToUse,
            emailVerified: true,
            role: "core_contributor",
          })
          .returning();

        const newUserRow = createdUsers[0];
        user = {
          id: newUserRow.id,
          email: newUserRow.email,
          name: newUserRow.username,
          role: (newUserRow.role as AuthRole) || "core_contributor",
        };
      } catch (dbError: any) {
        // Handle database uniqueness race conditions gracefully (checking both error and nested cause)
        const cause = dbError?.cause || dbError;
        const errorCode = cause?.code || dbError?.code;
        const errorMessage = String(cause?.message || dbError?.message || "");
        const errorDetail = String(cause?.detail || dbError?.detail || "");
        const errorConstraint = String(cause?.constraint || dbError?.constraint || "");

        if (
          errorCode === "23505" ||
          errorMessage.includes("unique") ||
          errorMessage.includes("duplicate key")
        ) {
          if (
            errorMessage.includes("username") ||
            errorDetail.includes("username") ||
            errorConstraint.includes("username")
          ) {
            throw new Error(
              "Username is already taken. Please choose another."
            );
          }
          // If duplicate email, query again
          const retryUsers = await db
            .select()
            .from(schema.users)
            .where(eq(sql`LOWER(${schema.users.email})`, email))
            .limit(1);

          if (retryUsers && retryUsers.length > 0) {
            const retryRow = retryUsers[0];
            user = {
              id: retryRow.id,
              email: retryRow.email,
              name: retryRow.username,
              role: (retryRow.role as AuthRole) || "core_contributor",
            };
          } else {
            throw new Error(
              "An account with this email already exists. Please log in."
            );
          }
        } else {
          console.error("[verifyCode] Database user creation error:", dbError);
          throw new Error("Failed to create user account. Please try again.");
        }
      }
    }
  } else {
    // Fallback if DATABASE_URL is not configured
    const username =
      submittedUsername ||
      existingVerification.username ||
      email.split("@")[0] ||
      "User";

    user = {
      id: `user-${email.replace(/[^a-zA-Z0-9]/g, "")}`,
      email,
      name: username,
      role: "core_contributor",
    };
  }

  // ====================
  // CREATE PERSISTENT SESSION AND HTTP-ONLY COOKIE
  // ====================
  await serverAuth.createSession(user);

  // Single-use: cleanup verification record immediately
  await deleteVerification(email);

  return {
    success: true,
    message: isNewUser
      ? "Account created successfully!"
      : "Logged in successfully!",
    userId: user.id,
    username: user.name,
    email: user.email,
    isNewUser,
  };
}