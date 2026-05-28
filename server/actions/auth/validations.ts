import { db } from "@/server/db/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

import { USERNAME_REGEX } from "./constants";

export function validateEmail(email?: string) {
  if (!email) {
    throw new Error("Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }
}

export async function validateUsername(username?: string) {
  if (!username) {
    throw new Error("Username is required");
  }

  if (username.length < 3 || username.length > 20) {
    throw new Error(
      "Username must be 3-20 characters long"
    );
  }

  if (!USERNAME_REGEX.test(username)) {
    throw new Error(
      "Username can only contain letters, numbers, underscores (_), and hyphens (-)"
    );
  }

  const existingUsername = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (existingUsername) {
    throw new Error(
      "Username is already taken. Please choose another one."
    );
  }
}