import type { AuthUser, AuthSession } from "../types";
import {
  generateToken,
  hashToken,
  calculateExpirationTimestamp,
  isTokenExpired,
  DEFAULT_SESSION_DURATION_SECONDS,
} from "../utils/token";

/**
 * Session Store Layer for CODEXEDOC Authentication Architecture.
 *
 * Encapsulates session creation, retrieval, validation, and invalidation.
 * Tokens stored internally are indexed by their SHA-256 hash to prevent raw
 * token exposure in memory logs or dumps.
 *
 * @see ADR-002 — Authentication Architecture
 */
export class SessionStore {
  /** Internal in-memory store mapping token hash to AuthSession. */
  private sessions = new Map<string, AuthSession>();

  /**
   * Create a new session for a user and return the AuthSession object.
   *
   * @param user            - The authenticated user identity.
   * @param durationSeconds - Optional custom session TTL in seconds.
   */
  async createSession(
    user: AuthUser,
    durationSeconds: number = DEFAULT_SESSION_DURATION_SECONDS
  ): Promise<AuthSession> {
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = calculateExpirationTimestamp(durationSeconds);

    const session: AuthSession = {
      user,
      expiresAt,
      token: rawToken,
    };

    // Store by hash for security
    this.sessions.set(tokenHash, session);

    return session;
  }

  /**
   * Retrieve an active session by token. Returns `null` if non-existent or expired.
   *
   * @param token - The raw session token.
   */
  async getSession(token: string): Promise<AuthSession | null> {
    if (!token || token.trim() === "") {
      return null;
    }

    const tokenHash = hashToken(token);
    const session = this.sessions.get(tokenHash);

    if (!session) {
      return null;
    }

    // Check expiration
    if (isTokenExpired(session.expiresAt)) {
      this.sessions.delete(tokenHash);
      return null;
    }

    return session;
  }

  /**
   * Delete / invalidate a session by token.
   *
   * @param token - The raw session token.
   */
  async deleteSession(token: string): Promise<void> {
    if (!token) return;
    const tokenHash = hashToken(token);
    this.sessions.delete(tokenHash);
  }

  /**
   * Alias for `deleteSession` to explicitly invalidate session credentials.
   *
   * @param token - The raw session token.
   */
  async invalidateSession(token: string): Promise<void> {
    await this.deleteSession(token);
  }

  /**
   * Purge all expired sessions from memory.
   */
  async cleanupExpiredSessions(): Promise<void> {
    for (const [hash, session] of this.sessions.entries()) {
      if (isTokenExpired(session.expiresAt)) {
        this.sessions.delete(hash);
      }
    }
  }

  /**
   * Return the total count of active sessions (useful for telemetry / stats).
   */
  async getActiveSessionCount(): Promise<number> {
    await this.cleanupExpiredSessions();
    return this.sessions.size;
  }
}

/** Singleton instance exported for production provider usage. */
export const sessionStore = new SessionStore();
