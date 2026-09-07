import { getDb, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export interface VerificationRecord {
  id?: string;
  email: string;
  username?: string;
  codeHash: string;
  attempts: number;
  sendCount?: number;
  lastSentAt: Date;
  expiresAt: Date;
  ipAddress?: string;
}

// In-memory verification cache fallback for Community Mode
const memoryVerifications = new Map<string, VerificationRecord>();

function isProductionDatabase(): boolean {
  return process.env.USE_AUTH === "true" && Boolean(process.env.DATABASE_URL);
}

/**
 * Get an active verification record for an email.
 */
export async function getVerification(
  email: string
): Promise<VerificationRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isProductionDatabase()) {
    try {
      const db = getDb();
      const results = await db
        .select()
        .from(schema.verificationCodes)
        .where(eq(sql`LOWER(${schema.verificationCodes.email})`, normalizedEmail))
        .limit(1);

      if (!results || results.length === 0) {
        return null;
      }

      const row = results[0];
      return {
        id: row.id,
        email: row.email,
        username: row.username || undefined,
        codeHash: row.codeHash,
        attempts: row.attempts,
        sendCount: row.sendCount,
        lastSentAt: row.lastSentAt,
        expiresAt: row.expiresAt,
        ipAddress: row.ipAddress || undefined,
      };
    } catch (error) {
      console.error("[verificationStore] Error getting verification:", error);
      return null;
    }
  }

  return memoryVerifications.get(normalizedEmail) || null;
}

/**
 * Save or update a verification record for an email.
 */
export async function saveVerification(record: {
  email: string;
  username?: string;
  codeHash: string;
  attempts?: number;
  lastSentAt: Date;
  expiresAt: Date;
  ipAddress?: string;
}): Promise<void> {
  const normalizedEmail = record.email.trim().toLowerCase();

  if (isProductionDatabase()) {
    try {
      const db = getDb();
      const existing = await getVerification(normalizedEmail);

      if (existing && existing.id) {
        await db
          .update(schema.verificationCodes)
          .set({
            username: record.username || existing.username,
            codeHash: record.codeHash,
            attempts: record.attempts ?? 0,
            sendCount: (existing.sendCount || 1) + 1,
            lastSentAt: record.lastSentAt,
            expiresAt: record.expiresAt,
            ipAddress: record.ipAddress || existing.ipAddress,
          })
          .where(eq(schema.verificationCodes.id, existing.id));
      } else {
        await db.insert(schema.verificationCodes).values({
          email: normalizedEmail,
          username: record.username,
          codeHash: record.codeHash,
          attempts: record.attempts ?? 0,
          sendCount: 1,
          lastSentAt: record.lastSentAt,
          expiresAt: record.expiresAt,
          ipAddress: record.ipAddress,
          ipSendCount: 1,
        });
      }
      return;
    } catch (error) {
      console.error("[verificationStore] Error saving verification:", error);
      throw error;
    }
  }

  memoryVerifications.set(normalizedEmail, {
    email: normalizedEmail,
    username: record.username,
    codeHash: record.codeHash,
    attempts: record.attempts ?? 0,
    lastSentAt: record.lastSentAt,
    expiresAt: record.expiresAt,
    ipAddress: record.ipAddress,
  });
}

/**
 * Increment failed attempts counter for an email verification.
 */
export async function incrementAttempts(email: string): Promise<number> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isProductionDatabase()) {
    try {
      const db = getDb();
      const existing = await getVerification(normalizedEmail);
      if (!existing || !existing.id) {
        return 0;
      }
      const newAttempts = existing.attempts + 1;
      await db
        .update(schema.verificationCodes)
        .set({ attempts: newAttempts })
        .where(eq(schema.verificationCodes.id, existing.id));
      return newAttempts;
    } catch (error) {
      console.error("[verificationStore] Error incrementing attempts:", error);
      return 0;
    }
  }

  const existing = memoryVerifications.get(normalizedEmail);
  if (existing) {
    existing.attempts += 1;
    return existing.attempts;
  }
  return 0;
}

/**
 * Delete / invalidate a verification record after completion or expiration.
 */
export async function deleteVerification(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  if (isProductionDatabase()) {
    try {
      const db = getDb();
      await db
        .delete(schema.verificationCodes)
        .where(eq(sql`LOWER(${schema.verificationCodes.email})`, normalizedEmail));
    } catch (error) {
      console.error("[verificationStore] Error deleting verification:", error);
    }
    return;
  }

  memoryVerifications.delete(normalizedEmail);
}
