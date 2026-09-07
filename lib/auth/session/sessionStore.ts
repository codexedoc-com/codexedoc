import type { AuthUser, AuthSession, AuthRole } from "../types";
import {
  generateToken,
  hashToken,
  calculateExpirationTimestamp,
  isTokenExpired,
  DEFAULT_SESSION_DURATION_SECONDS,
} from "../utils/token";
import { getDb, schema } from "@/lib/db";
import { eq, and, gt, lte, sql } from "drizzle-orm";

/**
 * Session Store Layer for CODEXEDOC Authentication Architecture.
 *
 * Encapsulates session creation, retrieval, validation, and invalidation.
 * In Production Mode (USE_AUTH=true), sessions are persistently stored in
 * PostgreSQL / Neon (auth_sessions table) indexed by SHA-256 token hash.
 *
 * In Community Mode (USE_AUTH=false) or when database is not configured,
 * an in-memory Map fallback is maintained for zero-friction local development.
 *
 * @see ADR-002 — Authentication Architecture
 */
export class SessionStore {
  /** In-memory fallback map for Community Mode / local dev without DB */
  private memorySessions = new Map<string, AuthSession>();

  private isProductionDatabase(): boolean {
    return process.env.USE_AUTH === "true" && Boolean(process.env.DATABASE_URL);
  }

  /**
   * Create a new persistent session for a user and return the AuthSession object.
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
    const expiresDate = new Date(expiresAt);

    if (this.isProductionDatabase()) {
      const db = getDb();
      await db.insert(schema.authSessions).values({
        userId: user.id,
        tokenHash,
        expiresAt: expiresDate,
      });
    } else {
      this.memorySessions.set(tokenHash, {
        user,
        expiresAt,
        token: rawToken,
      });
    }

    return {
      user,
      expiresAt,
      token: rawToken,
    };
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

    if (this.isProductionDatabase()) {
      try {
        const db = getDb();
        const now = new Date();

        const results = await db
          .select({
            sessionId: schema.authSessions.id,
            expiresAt: schema.authSessions.expiresAt,
            userId: schema.users.id,
            email: schema.users.email,
            username: schema.users.username,
            role: schema.users.role,
          })
          .from(schema.authSessions)
          .innerJoin(
            schema.users,
            eq(schema.authSessions.userId, schema.users.id)
          )
          .where(
            and(
              eq(schema.authSessions.tokenHash, tokenHash),
              gt(schema.authSessions.expiresAt, now)
            )
          )
          .limit(1);

        if (!results || results.length === 0) {
          // Check if it exists but is expired, and clean up
          await db
            .delete(schema.authSessions)
            .where(
              and(
                eq(schema.authSessions.tokenHash, tokenHash),
                lte(schema.authSessions.expiresAt, now)
              )
            );
          return null;
        }

        const row = results[0];
        const user: AuthUser = {
          id: row.userId,
          email: row.email,
          name: row.username,
          role: (row.role as AuthRole) || "community_contributor",
        };

        return {
          user,
          expiresAt: row.expiresAt.toISOString(),
          token: rawTokenFromSession(token),
        };
      } catch (error) {
        console.error("[SessionStore] Error querying database session:", error);
        return null;
      }
    }

    // In-memory fallback
    const session = this.memorySessions.get(tokenHash);
    if (!session) {
      return null;
    }

    if (isTokenExpired(session.expiresAt)) {
      this.memorySessions.delete(tokenHash);
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

    if (this.isProductionDatabase()) {
      try {
        const db = getDb();
        await db
          .delete(schema.authSessions)
          .where(eq(schema.authSessions.tokenHash, tokenHash));
      } catch (error) {
        console.error("[SessionStore] Error deleting session from database:", error);
      }
    } else {
      this.memorySessions.delete(tokenHash);
    }
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
   * Purge all expired sessions.
   */
  async cleanupExpiredSessions(): Promise<void> {
    if (this.isProductionDatabase()) {
      try {
        const db = getDb();
        await db
          .delete(schema.authSessions)
          .where(lte(schema.authSessions.expiresAt, new Date()));
      } catch (error) {
        console.error("[SessionStore] Error cleaning expired sessions:", error);
      }
    } else {
      for (const [hash, session] of this.memorySessions.entries()) {
        if (isTokenExpired(session.expiresAt)) {
          this.memorySessions.delete(hash);
        }
      }
    }
  }

  /**
   * Return the total count of active sessions.
   */
  async getActiveSessionCount(): Promise<number> {
    if (this.isProductionDatabase()) {
      try {
        const db = getDb();
        const results = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.authSessions)
          .where(gt(schema.authSessions.expiresAt, new Date()));
        return results[0]?.count || 0;
      } catch {
        return 0;
      }
    }

    await this.cleanupExpiredSessions();
    return this.memorySessions.size;
  }
}

function rawTokenFromSession(token: string): string {
  return token;
}

/** Singleton instance exported for provider and proxy usage. */
export const sessionStore = new SessionStore();
