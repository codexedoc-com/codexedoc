import { getClientIp } from "./utils";

export async function verifyTurnstile(token?: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!token) {
    if (!secretKey || !siteKey || isDevelopment) {
      return getClientIp();
    }

    return getClientIp();
  }

  if (!secretKey) {
    if (isDevelopment) {
      return getClientIp();
    }

    return getClientIp();
  }

  const ipAddress = await getClientIp();

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
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      "Bot detection failed. Please refresh and try again."
    );
  }

  return ipAddress;
}