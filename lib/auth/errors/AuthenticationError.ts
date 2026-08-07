import { BaseAuthError } from "./BaseAuthError";

/**
 * Thrown when credential validation or login processing fails.
 */
export class AuthenticationError extends BaseAuthError {
  public readonly statusCode = 400;

  constructor(message = "Authentication failed: Invalid credentials") {
    super(message);
    this.name = "AuthenticationError";
  }
}
