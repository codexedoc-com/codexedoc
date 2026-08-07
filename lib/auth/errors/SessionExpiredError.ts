import { BaseAuthError } from "./BaseAuthError";

/**
 * Thrown when a session token has expired.
 */
export class SessionExpiredError extends BaseAuthError {
  public readonly statusCode = 401;

  constructor(message = "Session expired: Please log in again") {
    super(message);
    this.name = "SessionExpiredError";
  }
}
