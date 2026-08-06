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
   * Validate a session token and return the associated session if valid.
   *
   * @param token - The opaque session token to verify.
   * @returns The `AuthSession` if the token is valid, or `null` otherwise.
   */
  verifySession(token: string): Promise<AuthSession | null>;
}
