"use server";

import { eq } from "drizzle-orm";

import { db } from "@/server/db/db";
import { users, verificationCodes } from "@/server/db/schema";

import {
  MAX_VERIFY_ATTEMPTS,
} from "./constants";

import { hashCode } from "./utils";

export async function verifyCode(
  formData: FormData
) {
  const email = formData
    .get("email")
    ?.toString()
    .trim()
    .toLowerCase();

  const code = formData
    .get("verificationCode")
    ?.toString()
    .trim();

  const submittedUsername = formData
    .get("username")
    ?.toString()
    .trim();

  // ====================
  // BASIC VALIDATION
  // ====================

  if (!email || !code) {
    throw new Error(
      "Email and code are required"
    );
  }

  // ====================
  // GET VERIFICATION RECORD
  // ====================

  const existingVerification =
    await db.query.verificationCodes.findFirst({
      where: eq(verificationCodes.email, email),
    });

  if (!existingVerification) {
    throw new Error(
      "No verification request found. Please request a new code."
    );
  }

  // ====================
  // EXPIRED CODE
  // ====================

  if (
    existingVerification.expiresAt <
    new Date()
  ) {
    await db
      .delete(verificationCodes)
      .where(eq(verificationCodes.email, email));

    throw new Error(
      "Code has expired. Please request a new one."
    );
  }

  // ====================
  // TOO MANY ATTEMPTS
  // ====================

  if (
    existingVerification.attempts >=
    MAX_VERIFY_ATTEMPTS
  ) {
    await db
      .delete(verificationCodes)
      .where(eq(verificationCodes.email, email));

    throw new Error(
      "Too many failed attempts. Please request a new code."
    );
  }

  // ====================
  // VERIFY CODE
  // ====================

  const codeHash = hashCode(code);

  if (
    codeHash !== existingVerification.codeHash
  ) {
    await db
      .update(verificationCodes)
      .set({
        attempts:
          existingVerification.attempts + 1,
      })
      .where(eq(verificationCodes.email, email));

    throw new Error(
      "Invalid verification code"
    );
  }

  // ====================
  // CHECK USER
  // ====================

  const existingUser =
    await db.query.users.findFirst({
      where: eq(users.email, email),
    });

  const isNewUser = !existingUser;

  // ====================
  // REGISTER
  // ====================

  if (isNewUser) {
    const usernameToUse =
      submittedUsername ||
      existingVerification.username;

    if (!usernameToUse) {
      throw new Error(
        "Username is required for registration"
      );
    }

    // Double-check username availability
    const existingUserByUsername =
      await db.query.users.findFirst({
        where: eq(
          users.username,
          usernameToUse
        ),
      });

    if (existingUserByUsername) {
      throw new Error(
        "Username is already taken. Please choose another one."
      );
    }

    const [newUser] = await db
      .insert(users)
      .values({
        username: usernameToUse,
        email,
        emailVerified: true,
      })
      .returning();

    // Cleanup verification record
    await db
      .delete(verificationCodes)
      .where(eq(verificationCodes.email, email));

    return {
      success: true,
      message:
        "Account created successfully!",
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isNewUser: true,
    };
  }

  // ====================
  // LOGIN
  // ====================

  if (!existingUser.emailVerified) {
    await db
      .update(users)
      .set({
        emailVerified: true,
      })
      .where(eq(users.email, email));
  }

  // Cleanup verification record
  await db
    .delete(verificationCodes)
    .where(eq(verificationCodes.email, email));

  return {
    success: true,
    message: "Logged in successfully!",
    userId: existingUser.id,
    username: existingUser.username,
    email: existingUser.email,
    isNewUser: false,
  };
}