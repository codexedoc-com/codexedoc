import { USERNAME_REGEX } from "./constants";

/**
 * Validate an email address format.
 *
 * @throws {Error} When email is missing or has an invalid format.
 */
export function validateEmail(email?: string): void {
  if (!email) {
    throw new Error("Email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }
}

/**
 * Validate a username format and length.
 *
 * @throws {Error} When username is missing, wrong length, or invalid format.
 */
export function validateUsername(username?: string): void {
  if (!username) {
    throw new Error("Username is required");
  }

  if (username.length < 3 || username.length > 20) {
    throw new Error("Username must be 3-20 characters long");
  }

  if (!USERNAME_REGEX.test(username)) {
    throw new Error(
      "Username can only contain letters, numbers, underscores (_), and hyphens (-)"
    );
  }
}
