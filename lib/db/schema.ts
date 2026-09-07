import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * CODEXEDOC Database Schema — Authentication Tables
 *
 * Defines the persistent storage models required by ADR-002:
 * - `users`: Canonical user identity with case-insensitive username & email uniqueness.
 * - `auth_sessions`: Persistent session store indexed by token hash (SHA-256).
 * - `verification_codes`: Passwordless verification codes with expiration and attempt tracking.
 *
 * @see ADR-002 — Authentication Architecture
 */

// ─── Users ──────────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 100 }).notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    role: varchar("role", { length: 50 }).notNull().default("community_contributor"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique_idx").on(sql`LOWER(${table.email})`),
    uniqueIndex("users_username_unique_idx").on(sql`LOWER((${table.username})::text)`),
  ]
);

// ─── Auth Sessions ──────────────────────────────────────────────────────────────

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_sessions_token_hash_idx").on(table.tokenHash),
    index("auth_sessions_expires_at_idx").on(table.expiresAt),
    index("auth_sessions_user_id_idx").on(table.userId),
  ]
);

// ─── Verification Codes ─────────────────────────────────────────────────────────

export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    username: text("username"),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    sendCount: integer("send_count").notNull().default(1),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    ipSendCount: integer("ip_send_count").notNull().default(1),
  },
  (table) => [
    uniqueIndex("verification_codes_email_idx").on(sql`LOWER(${table.email})`),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuthSessionRecord = typeof authSessions.$inferSelect;
export type VerificationCodeRecord = typeof verificationCodes.$inferSelect;
