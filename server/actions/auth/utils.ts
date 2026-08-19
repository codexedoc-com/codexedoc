import crypto from "crypto";
import { headers } from "next/headers";

/**
 * Retrieve the client IP address from request headers.
 *
 * Uses standard reverse-proxy headers (x-forwarded-for, x-real-ip)
 * to determine the originating client IP.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    return headersList.get("x-real-ip") || "unknown";
  } catch {
    return "127.0.0.1";
  }
}

/**
 * Generate a 6-digit numeric verification code.
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a SHA-256 hash of a verification code for secure storage.
 */
export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}
