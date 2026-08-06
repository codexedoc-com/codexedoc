import type { IAuthProvider } from "../contracts/IAuthProvider";
import { LocalDevAuthProvider } from "../providers/LocalDevAuthProvider";
import { ProductionAuthProvider } from "../providers/ProductionAuthProvider";

/**
 * Authentication Gateway — the single entry point for identity resolution.
 *
 * Reads `process.env.USE_AUTH` at module load time and instantiates the
 * appropriate provider. The rest of the application imports `serverAuth`
 * and never knows — or needs to know — which provider is active.
 *
 * **Safety invariant (ADR-002):** If `USE_AUTH=false` is detected when
 * `NODE_ENV=production`, the process crashes immediately with a fatal error.
 * This is a non-negotiable security boundary.
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

// ─── Safety Check ──────────────────────────────────────────────────────────────
// Prevent Community Mode from ever running in a production build.
if (
  process.env.NODE_ENV === "production" &&
  process.env.USE_AUTH === "false"
) {
  throw new Error(
    "FATAL: USE_AUTH=false is not allowed when NODE_ENV=production. " +
    "Community Mode must never run in a production environment. " +
    "Set USE_AUTH=true or remove the variable entirely. " +
    "See ADR-002 — Authentication Architecture."
  );
}

// ─── Provider Resolution ────────────────────────────────────────────────────────
function resolveProvider(): IAuthProvider {
  const useAuth = process.env.USE_AUTH;

  // USE_AUTH is "true" → Production Mode
  if (useAuth === "true") {
    return new ProductionAuthProvider();
  }

  // USE_AUTH is "false", undefined, or any other value → Community Mode
  // This matches the ADR-002 default: .env.example ships with USE_AUTH=false,
  // and missing variables also fall through to the safe local provider.
  return new LocalDevAuthProvider();
}

/**
 * The singleton authentication provider for server-side code.
 *
 * Exposes every method defined in `IAuthProvider`. Consumers call
 * `serverAuth.requireUser()`, `serverAuth.getUser()`, etc.
 */
export const serverAuth: IAuthProvider = resolveProvider();
