"use server";

import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { db } from "@/server/db/db";
import { users } from "@/server/db/schema";

// Helper: validate UUIDs to avoid passing demo IDs into uuid columns
export async function isValidUUID(id?: string): Promise<boolean> {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  );
}

export async function getCurrentUser(userId?: string) {
  if (!userId) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("codexedoc_token")?.value;

      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as { userId?: string };
        if (payload?.userId) {
          userId = payload.userId;
        }
      }
    } catch (e) {
      console.warn("getCurrentUser: failed to verify token", e);
    }
  }

  const normalizedUserId = typeof userId === "string" && (await isValidUUID(userId)) ? userId : undefined;

  if (!normalizedUserId) {
    return null;
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, normalizedUserId))
      .limit(1);

    return user ?? null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}