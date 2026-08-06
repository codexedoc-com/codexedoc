/**
 * Core authentication types for the CODEXEDOC Authentication Abstraction Layer.
 *
 * These types define the canonical identity and session contracts consumed by
 * all business domains. Domain code interacts exclusively with these types —
 * never with raw provider-specific models.
 *
 * @see ADR-002 — Authentication Architecture
 */

/**
 * Contributor role tiers as defined in ADR-004 (Contributor Workflow).
 *
 * Maps directly to the RBAC permission matrix in ADR-002.
 */
export type AuthRole =
  | "visitor"
  | "community_contributor"
  | "core_contributor"
  | "maintainer"
  | "founder";

/**
 * The canonical authenticated user identity returned by every `IAuthProvider`.
 *
 * Both `LocalDevAuthProvider` and `ProductionAuthProvider` produce structurally
 * identical `AuthUser` objects so that domain code behaves identically
 * regardless of the active provider.
 */
export interface AuthUser {
  /** Deterministic, stable user identifier. */
  id: string;
  /** User email address. */
  email: string;
  /** Display name. */
  name: string;
  /** RBAC role aligned with ADR-004 contributor tiers. */
  role: AuthRole;
}

/**
 * Represents an authenticated session.
 *
 * In Community Mode the session is always valid and never expires.
 * In Production Mode the session is backed by a JWT with a real expiry.
 */
export interface AuthSession {
  /** The authenticated user associated with this session. */
  user: AuthUser;
  /** ISO-8601 timestamp when the session expires. */
  expiresAt: string;
  /** Opaque session token (empty string in Community Mode). */
  token: string;
}
