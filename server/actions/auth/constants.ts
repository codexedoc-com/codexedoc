export const CODE_EXPIRY_MINUTES = 10;

export const RESEND_COOLDOWN_SECONDS = 60;

export const MAX_SENDS_PER_HOUR = 5;

export const MAX_SENDS_PER_IP_PER_HOUR = 10;

export const MAX_VERIFY_ATTEMPTS = 5;

// Allow names with letters, numbers, spaces, hyphens, apostrophes, and dots (2-50 chars)
export const USERNAME_REGEX = /^[a-zA-Z0-9\s'._-]{2,50}$/;