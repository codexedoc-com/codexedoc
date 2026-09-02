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
    throw new Error("Name is required");
  }

  const trimmed = username.trim();

  if (trimmed.length < 2 || trimmed.length > 50) {
    throw new Error("Name must be between 2 and 50 characters long");
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    throw new Error(
      "Name can only contain letters, numbers, spaces, hyphens, periods, and apostrophes"
    );
  }
}