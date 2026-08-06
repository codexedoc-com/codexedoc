import type { IAuthProvider } from "../contracts/IAuthProvider";
import type { AuthUser, AuthSession } from "../types";
import { getMockUser } from "@/server/mockData";

/**
 * LocalDevAuthProvider — Community Mode authentication provider.
 *
 * Active when `USE_AUTH=false`. Provides an instant, pre-authenticated local
 * session with zero external dependencies. The deterministic user identity
 * ensures database seeds, automated tests, and local data remain consistent
 * across server restarts.
 *
 * The authenticated user ID is always `"mock-user"` because seeded data in
 * `mockData.ts` depends on this exact identifier.
 *
 * @see ADR-002 — Authentication Architecture
 */
export class LocalDevAuthProvider implements IAuthProvider {
  /**
   * Build an `AuthUser` from the existing mock user data.
   *
   * Reuses `getMockUser()` for the `id` and `email` fields so the local
   * provider stays in sync with the mock data layer.
   */
  private getDevUser(): AuthUser {
    const mock = getMockUser();

    return {
      id: mock.id,               // "mock-user" — required by seed data
      email: mock.email,         // "demo@codexedoc.com"
      name: mock.username,       // "Mock Learner"
      role: "community_contributor",
    };
  }

  /**
   * Build a never-expiring dev session wrapping the deterministic user.
   */
  private getDevSession(): AuthSession {
    return {
      user: this.getDevUser(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      token: "",
    };
  }

  /** Always returns the deterministic Community Mode user. */
  async getUser(): Promise<AuthUser | null> {
    return this.getDevUser();
  }

  /** Always returns the deterministic Community Mode user (never throws). */
  async requireUser(): Promise<AuthUser> {
    return this.getDevUser();
  }

  /**
   * In Community Mode login always succeeds and returns a dev session.
   * Credentials are accepted but ignored.
   */
  async login(_email: string, _password: string): Promise<AuthSession | null> {
    return this.getDevSession();
  }

  /** No-op in Community Mode — there is no session to invalidate. */
  async logout(): Promise<void> {
    // Nothing to clear in local development.
  }

  /**
   * In Community Mode every token is considered valid.
   * Returns the deterministic dev session regardless of the token value.
   */
  async verifySession(_token: string): Promise<AuthSession | null> {
    return this.getDevSession();
  }
}
