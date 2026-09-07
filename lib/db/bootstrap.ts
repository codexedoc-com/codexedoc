import { neon } from "@neondatabase/serverless";

/**
 * Ensures required authentication tables, columns, and indexes exist in PostgreSQL / Neon.
 * Runs seamlessly over HTTP without needing WebSockets.
 */
export async function bootstrapDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return;
  }

  const sql = neon(databaseUrl);

  // 1. Users table & columns
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(100) NOT NULL,
      email TEXT NOT NULL,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      role VARCHAR(50) NOT NULL DEFAULT 'community_contributor',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'community_contributor';
  `;

  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (LOWER(email));
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx ON users (LOWER((username)::text));
  `;

  // 2. Auth Sessions table
  await sql`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS auth_sessions_token_hash_idx ON auth_sessions (token_hash);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions (expires_at);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions (user_id);
  `;

  // 3. Verification Codes table
  await sql`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      username TEXT,
      code_hash TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      send_count INTEGER NOT NULL DEFAULT 1,
      last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_address TEXT,
      ip_send_count INTEGER NOT NULL DEFAULT 1
    );
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS verification_codes_email_idx ON verification_codes (LOWER(email));
  `;

  await sql`
    ALTER TABLE verification_codes ALTER COLUMN username DROP NOT NULL;
  `;
}
