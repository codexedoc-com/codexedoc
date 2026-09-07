"use server";

import { getClientIp } from "./utils";

/**
 * Verify a Cloudflare Turnstile challenge token server-side.
 *
 * Behavior by mode:
 * - **Community Mode** (`USE_AUTH=false` or missing Turnstile keys):
 *   Turnstile verification is gracefully bypassed. Returns the client IP
 *   without contacting Cloudflare. This allows contributors to run the
 *   application with zero external API keys.
 *
 * - **Production Mode** (`USE_AUTH=true` with Turnstile keys configured):
 *   Validates the token against Cloudflare's siteverify endpoint.
 *   Throws on verification failure or missing token.
 *
 * The Turnstile secret key (`TURNSTILE_SECRET_KEY`) is NEVER exposed
 * to the client. Only the site key (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`)
 * is available client-side.
 *
 * @param token - The `cf-turnstile-response` token from the client widget.
 * @returns The client IP address string.
 * @throws {Error} When Turnstile verification fails in production.
 */
export async function verifyTurnstile(token?: string): Promise<string> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const isEnforcedAuth = process.env.USE_AUTH === "true";

  const isPlaceholderSecret =
    !secretKey ||
    secretKey.includes("placeholder") ||
    secretKey.startsWith("your-") ||
    secretKey === "your-secret-key";

  const isPlaceholderSite =
    !siteKey ||
    siteKey.includes("placeholder") ||
    siteKey.startsWith("your-") ||
    siteKey === "your-site-key";

  // Community Mode or missing/placeholder configuration: bypass verification for local development
  if (!isEnforcedAuth || isPlaceholderSecret || isPlaceholderSite) {
    return getClientIp();
  }

  // Production Mode with Turnstile configured: require token
  if (!token || token.trim() === "") {
    throw new Error(
      "Verification challenge required. Please complete the security check."
    );
  }

  // Production Turnstile verification against Cloudflare endpoint
  const ipAddress = await getClientIp();

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: ipAddress,
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        "Bot detection challenge failed. Please refresh and try again."
      );
    }

    return ipAddress;
  } catch (error) {
    if (error instanceof Error && error.message.includes("challenge")) {
      throw error;
    }
    console.error("[Turnstile] Error during verification:", error);
    throw new Error("Security verification failed. Please try again.");
  }
}
