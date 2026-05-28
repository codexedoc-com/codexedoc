import crypto from "crypto";
import { headers } from "next/headers";

export async function getClientIp() {
  const headersList = await headers();

  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return headersList.get("x-real-ip") || "unknown";
}

export function generateVerificationCode() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

export function hashCode(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}