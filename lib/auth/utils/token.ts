import crypto from "crypto";

/**
 * Token management utility for CODEXEDOC Authentication Layer.
 *
 * Provides cryptographic token generation, SHA-256 token hashing,
 * constant-time comparisons, and timestamp expiration helpers.
 *
 * @see ADR-002 — Authentication Architecture
 */

/** Default session duration: 7 days in seconds. */
export const DEFAULT_SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

/**
 * Generate a cryptographically secure random token string.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a SHA-256 hash of a token string for safe storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Perform a constant-time comparison of two token strings to prevent timing attacks.
 */
export function compareTokens(tokenA: string, tokenB: string): boolean {
  const hashA = hashToken(tokenA);
  const hashB = hashToken(tokenB);
  const bufA = Buffer.from(hashA, "hex");
  const bufB = Buffer.from(hashB, "hex");

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Calculate an ISO-8601 expiration timestamp from a duration in seconds.
 */
export function calculateExpirationTimestamp(durationSeconds: number = DEFAULT_SESSION_DURATION_SECONDS): string {
  return new Date(Date.now() + durationSeconds * 1000).toISOString();
}

/**
 * Check whether an ISO-8601 timestamp string has passed.
 */
export function isTokenExpired(expiresAt: string): boolean {
  const expiryTime = new Date(expiresAt).getTime();
  return Number.isNaN(expiryTime) || Date.now() >= expiryTime;
}
