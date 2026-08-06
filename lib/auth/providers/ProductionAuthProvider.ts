import type { IAuthProvider } from "../contracts/IAuthProvider";
import type { AuthUser, AuthSession } from "../types";

/**
 * ProductionAuthProvider — Production Mode authentication provider.
 *
 * Active when `USE_AUTH=true`. In a future PR this class will implement full
 * JWT verification, session management against the production database, and
 * integration with external identity services (Resend, Turnstile, etc.).
 *
 * **Current status:** Contract stub only. Every method throws or returns
 * `null` to satisfy the `IAuthProvider` interface. This is intentional —
 * the goal of this PR is to define the abstraction layer, not implement
 * production authentication.
 *
 * @see ADR-002 — Authentication Architecture
 */
export class ProductionAuthProvider implements IAuthProvider {
  async getUser(): Promise<AuthUser | null> {
    // TODO: Implement JWT-based session lookup from HTTP-only cookie.
    return null;
  }

  async requireUser(): Promise<AuthUser> {
    // TODO: Implement JWT verification and user resolution.
    throw new Error("Not implemented: ProductionAuthProvider.requireUser()");
  }

  async login(_email: string, _password: string): Promise<AuthSession | null> {
    // TODO: Implement credential validation, Turnstile check, and session creation.
    throw new Error("Not implemented: ProductionAuthProvider.login()");
  }

  async logout(): Promise<void> {
    // TODO: Invalidate server session and clear HTTP-only cookie.
    throw new Error("Not implemented: ProductionAuthProvider.logout()");
  }

  async verifySession(_token: string): Promise<AuthSession | null> {
    // TODO: Implement cryptographic JWT verification with constant-time comparison.
    throw new Error("Not implemented: ProductionAuthProvider.verifySession()");
  }
}
