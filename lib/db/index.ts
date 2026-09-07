import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * CODEXEDOC Database Client — Lazy Neon HTTP Initialization
 *
 * Uses the stateless Neon HTTP driver for universal compatibility across
 * Server Actions, App Router pages, and Next.js 16 proxy.ts (which runs
 * in the Edge-like proxy runtime where persistent TCP connections are
 * unavailable).
 *
 * **Community Mode (`USE_AUTH=false`):**
 * - This module is never imported or called. Community Mode operates
 *   entirely via `LocalDevAuthProvider` and `mockData.ts` with zero
 *   database requirements.
 *
 * **Production Mode (`USE_AUTH=true`):**
 * - Requires `DATABASE_URL` to be set. If missing, `getDb()` throws
 *   a clear configuration error.
 *
 * @see ADR-002 — Authentication Architecture
 */

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get the database client singleton.
 *
 * Lazily initializes on first call to avoid crashing Community Mode
 * contributors who don't have `DATABASE_URL` configured.
 *
 * @throws {Error} If `DATABASE_URL` is not configured when called.
 */
export function getDb() {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "[CODEXEDOC DB] DATABASE_URL is not configured.\n" +
        "This is required for Production Mode (USE_AUTH=true).\n" +
        "Community Mode contributors do not need this."
    );
  }

  const sql = neon(databaseUrl);
  _db = drizzle(sql, { schema });
  return _db;
}

// Re-export schema for convenience
export { schema };
