import type { IAuthProvider } from "../contracts/IAuthProvider";
import { LocalDevAuthProvider } from "../providers/LocalDevAuthProvider";
import { ProductionAuthProvider } from "../providers/ProductionAuthProvider";
import { ConfigurationError } from "../errors";

/**
 * Authentication Gateway — the single entry point for identity resolution.
 *
 * Reads `process.env.USE_AUTH` at module load time and instantiates the
 * appropriate provider. The rest of the application imports `serverAuth`
 * and never knows — or needs to know — which provider is active.
 *
 * **Safety Invariants (ADR-002):**
 * 1. Community Mode (`USE_AUTH=false`) must NEVER run in `NODE_ENV=production`.
 * 2. Production Mode (`USE_AUTH=true`) requires valid authentication secrets (`AUTH_SECRET` or `JWT_SECRET`).
 *
 * @example
 * ```ts
 * import { serverAuth } from "@/lib/auth/gateway/serverAuth";
 *
 * const user = await serverAuth.requireUser();
 * ```
 *
 * @see ADR-002 — Authentication Architecture
 */

// ─── Environment Validation Safeguards ──────────────────────────────────────────

const nodeEnv = process.env.NODE_ENV;
const useAuth = process.env.USE_AUTH;

// Safety Invariant 1: Prevent Community Mode in production builds.
if (nodeEnv === "production" && useAuth === "false") {
  throw new ConfigurationError(
    "\n[CODEXEDOC AUTHENTICATION GATEWAY ERROR]\n" +
    "--------------------------------------------------------------------------------\n" +
    "WHAT HAPPENED:\n" +
    "  The system detected USE_AUTH=false while running in a production build (NODE_ENV=production).\n\n" +
    "WHY THIS IS INVALID:\n" +
    "  Community Mode (USE_AUTH=false) provides unauthenticated access for local development only.\n" +
    "  It is strictly forbidden in production builds per ADR-002 (Security Boundary Invariant).\n\n" +
    "HOW TO FIX IT:\n" +
    "  1. Set USE_AUTH=true in your environment variables or platform deployment settings.\n" +
    "  2. Configure AUTH_SECRET or JWT_SECRET with a 32+ character random secret string.\n" +
    "--------------------------------------------------------------------------------\n"
  );
}

// ─── Provider Resolution ────────────────────────────────────────────────────────

function resolveProvider(): IAuthProvider {
  // USE_AUTH is "true" → Production Mode
  if (useAuth === "true") {
    const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
    if (!secret || secret.trim().length < 8) {
      throw new ConfigurationError(
        "\n[CODEXEDOC AUTHENTICATION GATEWAY ERROR]\n" +
        "--------------------------------------------------------------------------------\n" +
        "WHAT HAPPENED:\n" +
        "  USE_AUTH=true is enabled but no valid AUTH_SECRET or JWT_SECRET was found.\n\n" +
        "WHY THIS IS INVALID:\n" +
        "  Production Mode requires a cryptographic secret key to sign and verify session tokens.\n\n" +
        "HOW TO FIX IT:\n" +
        "  1. Add AUTH_SECRET to your .env.local file or deployment environment settings.\n" +
        "  2. Provide a secret string at least 16 characters long (e.g. openssl rand -base64 32).\n" +
        "--------------------------------------------------------------------------------\n"
      );
    }
    return new ProductionAuthProvider();
  }

  // USE_AUTH is "false", undefined, or any other value → Community Mode
  // Default for local development per ADR-002. Requires zero configuration.
  return new LocalDevAuthProvider();
}

/**
 * The singleton authentication provider for server-side code.
 *
 * Exposes every method defined in `IAuthProvider`. Consumers call
 * `serverAuth.requireUser()`, `serverAuth.getUser()`, etc.
 */
export const serverAuth: IAuthProvider = resolveProvider();