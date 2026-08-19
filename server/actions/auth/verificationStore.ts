export interface VerificationRecord {
  email: string;
  username?: string;
  codeHash: string;
  attempts: number;
  lastSentAt: Date;
  expiresAt: Date;
}

// In-memory verification cache for active verification codes
export const activeVerifications = new Map<string, VerificationRecord>();
