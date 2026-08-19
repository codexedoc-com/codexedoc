import type { AuthUser, AuthSession } from "../types";

/**
 * IAuthProvider — the uniform authentication contract for CODEXEDOC.
 *
 * Every authentication provider (local dev, production, future SSO/OIDC)
 * must implement this interface without exception. Domain code interacts
 * exclusively with this contract via the Authentication Gateway; it never
 * references provider implementations directly.
 *
 * @see ADR-002 — Authentication Architecture
 */
export interface IAuthProvider {
  /**
   * Return the currently authenticated user, or `null` if no session exists.
   */
  getUser(): Promise<AuthUser | null>;

  /**
   * Return the currently authenticated user, or throw if no valid session
   * exists.
   *
   * This is the primary method used by Server Actions to enforce access
   * control. Every business action must call `requireUser()` before
   * performing any database mutation.
   *
   * @throws {Error} When no authenticated user can be resolved.
   */
  requireUser(): Promise<AuthUser>;

  /**
   * Authenticate a user with the provided credentials and return a new
   * session.
   *
   * @param email    - The user's email address.
   * @param password - The user's password (ignored in Community Mode).
   * @returns A new `AuthSession`, or `null` if authentication failed.
   */
  login(email: string, password: string): Promise<AuthSession | null>;

  /**
   * Invalidate the current session and clear client-side tokens.
   */
  logout(): Promise<void>;

  /**
   * Create an authenticated session for a verified user identity.
   *
   * Used by the email verification-code flow after the user's identity has
   * been confirmed. Unlike `login()`, this method does not validate
   * credentials — the caller is responsible for having already verified
   * the user (e.g. via a one-time code).
   *
   * Sets the authentication cookie and returns the new session.
   *
   * @param user - The verified user identity.
   * @returns The newly created `AuthSession`.
   */
  createSession(user: AuthUser): Promise<AuthSession>;

  /**
   * Validate a session token and return the associated session if valid.
   *
   * @param token - The opaque session token to verify.
   * @returns The `AuthSession` if the token is valid, or `null` otherwise.
   */
  verifySession(token: string): Promise<AuthSession | null>;
}
