import { BaseAuthError } from "./BaseAuthError";

/**
 * Thrown when an unauthenticated request attempts to access a protected resource.
 *
 * Primary error thrown by `IAuthProvider.requireUser()`.
 */
export class UnauthorizedError extends BaseAuthError {
  public readonly statusCode = 401;

  constructor(message = "Unauthorized: Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
