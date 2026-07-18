"use server";

import { authenticateMockUser } from "@/server/mockData";

export async function sendVerificationCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const username = formData.get("username")?.toString().trim() ?? "";

  if (!email) {
    throw new Error("Email is required");
  }

  authenticateMockUser(email, username || undefined);
  return {
    success: true,
    message: "Mock verification code sent.",
  };
}

export async function verifyCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const code = formData.get("verificationCode")?.toString().trim() ?? "";
  const username = formData.get("username")?.toString().trim() ?? "";

  if (!email || !code) {
    throw new Error("Email and code are required");
  }

  authenticateMockUser(email, username || undefined);
  return {
    success: true,
    message: "Logged in successfully!",
  };
}
