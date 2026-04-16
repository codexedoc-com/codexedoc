export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check length
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters");
  }

  // Check uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check lowercase
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check numbers
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check symbols
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one symbol (!@#$%^&* etc.)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
