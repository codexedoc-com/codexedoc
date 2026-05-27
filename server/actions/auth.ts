"use server";

import crypto from "crypto";
import nodemailer from "nodemailer";

import { eq } from "drizzle-orm";

import { db } from "@/server/db/db";
import { verificationCodes, users } from "@/server/db/schema";

const CODE_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_SENDS_PER_HOUR = 5;

// Username validation regex
const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

// =========================
// EMAIL TRANSPORTER
// =========================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
  },
  from: {
    name: "CODEXEDOC",                    // This shows as sender name
    address: "verify@codexedoc.com"       // This is the actual email
  },
});

// ==================== SEND VERIFICATION CODE ====================
export async function sendVerificationCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const username = formData.get("username")?.toString().trim();
  const mode = formData.get("mode")?.toString() || "register";

  if (!email) {
    throw new Error("Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }

  if (mode === "register") {
    if (!username) throw new Error("Username is required");
    if (username.length < 3 || username.length > 20) {
      throw new Error("Username must be 3-20 characters long");
    }
    if (!USERNAME_REGEX.test(username)) {
      throw new Error("Username can only contain letters, numbers, underscore (_), hyphen (-), and period (.)");
    }
  }

  // ======================
  // CHECK EMAIL EXISTENCE
  // ======================
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (mode === "register" && existingUser) {
    throw new Error("An account with this email already exists. Please login instead.");
  }

  if (mode === "login" && !existingUser) {
    throw new Error("No account found with this email. Please register first.");
  }

  const now = new Date();

  const existingVerification = await db.query.verificationCodes.findFirst({
    where: eq(verificationCodes.email, email),
  });

  // Resend cooldown
  if (existingVerification?.lastSentAt) {
    const secondsSinceLastSend = (now.getTime() - existingVerification.lastSentAt.getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
      throw new Error(`Please wait ${waitTime}s before requesting another code`);
    }
  }

  // Hourly rate limit
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const createdWithinHour = existingVerification && existingVerification.createdAt > oneHourAgo;

  let sendCount = 1;
  if (createdWithinHour && existingVerification) {
    sendCount = existingVerification.sendCount + 1;
    if (sendCount > MAX_SENDS_PER_HOUR) {
      throw new Error("Too many verification requests. Try again later.");
    }
  }

  // Generate code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000);

  // Save or update verification record
  if (existingVerification) {
    await db
      .update(verificationCodes)
      .set({
        username: mode === "register" ? username : existingVerification.username,
        codeHash,
        attempts: 0,
        sendCount,
        lastSentAt: now,
        expiresAt,
        createdAt: createdWithinHour ? existingVerification.createdAt : now,
      })
      .where(eq(verificationCodes.email, email));
  } else {
    await db.insert(verificationCodes).values({
      email,
      username: mode === "register" ? username! : "",
      codeHash,
      attempts: 0,
      sendCount: 1,
      lastSentAt: now,
      expiresAt,
      createdAt: now,
    });
  }

  // Send email
  try {
    await transporter.sendMail({
      from: {
        name: "CODEXEDOC",
        address: "verify@codexedoc.com"
      },
      to: email,
      subject: "CODEXEDOC Verification",
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
          <h2>Your verification code</h2>
          <h1 style="font-size: 42px; letter-spacing: 8px; color: #1f2937;">${code}</h1>
          <p>This code will expire in ${CODE_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send verification email. Please try again.");
  }

  return { success: true, message: "Code sent" };
}

// ==================== VERIFY CODE ====================
export async function verifyCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const code = formData.get("code")?.toString().trim();
  const submittedUsername = formData.get("username")?.toString().trim();

  if (!email || !code) {
    throw new Error("Email and code are required");
  }

  const existingVerification = await db.query.verificationCodes.findFirst({
    where: eq(verificationCodes.email, email),
  });

  if (!existingVerification) {
    throw new Error("No verification request found. Please request a new code.");
  }

  if (existingVerification.expiresAt < new Date()) {
    throw new Error("Code has expired. Please request a new one.");
  }

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  if (codeHash !== existingVerification.codeHash) {
    await db
      .update(verificationCodes)
      .set({ attempts: existingVerification.attempts + 1 })
      .where(eq(verificationCodes.email, email));

    throw new Error("Invalid verification code");
  }

  const existingUserByEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const isNewUser = !existingUserByEmail;

  if (isNewUser) {
    const usernameToUse = submittedUsername || existingVerification.username;

    if (!usernameToUse) {
      throw new Error("Username is required for registration");
    }

    const existingUserByUsername = await db.query.users.findFirst({
      where: eq(users.username, usernameToUse),
    });

    if (existingUserByUsername) {
      throw new Error("Username is already taken. Please choose another one.");
    }

    const [newUser] = await db
      .insert(users)
      .values({
        username: usernameToUse,
        email,
        emailVerified: true,
      })
      .returning();

    await db.delete(verificationCodes).where(eq(verificationCodes.email, email));

    return {
      success: true,
      message: "Account created successfully!",
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isNewUser: true,
    };
  } else {
    if (!existingUserByEmail.emailVerified) {
      await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.email, email));
    }

    await db.delete(verificationCodes).where(eq(verificationCodes.email, email));

    return {
      success: true,
      message: "Logged in successfully!",
      userId: existingUserByEmail.id,
      username: existingUserByEmail.username,
      email: existingUserByEmail.email,
      isNewUser: false,
    };
  }
}