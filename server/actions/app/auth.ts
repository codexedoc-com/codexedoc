"use server";

import { db } from "@/server/db/db";
import { users } from "@/server/db/schema";
import jwt from "jsonwebtoken";

// Helper: validate UUIDs to avoid passing demo IDs into uuid columns
export function isValidUUID(id?: string) {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  );
}

// Demo user ID used for local/demo mode operations.
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getCurrentUser(userId?: string) {
  // If no userId provided, try to read from JWT cookie
  if (!userId) {
    try {
      let cookieStore;
      try {
        const headers = await import('next/headers');
        cookieStore = headers.cookies ? await headers.cookies() : undefined;
      } catch (e) {
        cookieStore = undefined;
      }
      const token = cookieStore?.get?.("codexedoc_token")?.value;
      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any;
        if (payload?.userId) userId = payload.userId;
      }
    } catch (e) {
      console.warn("getCurrentUser: failed to verify token", e);
    }
  }

  // Demo mode: handle demo user IDs or missing user
  if (!userId || userId.startsWith?.("demo-")) {
    return {
      id: DEMO_USER_ID,
      username: "Demo Learner",
      email: "demo@codexedoc.com",
    };
  }

  // Reject obviously invalid UUIDs to avoid database errors
  if (!isValidUUID(userId)) {
    console.warn("getCurrentUser: invalid UUID provided:", userId);
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: { id: userId } as any,
    });

    return user || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
