import { getClientIp } from "./utils";

export async function verifyTurnstile(token?: string) {
  if (!token) {
    throw new Error(
      "Verification required. Please try again."
    );
  }

  const ipAddress = await getClientIp();

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
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