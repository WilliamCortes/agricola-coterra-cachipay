export type StoredPasswordResetToken = {
  id: number;
  adminUserId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export interface PasswordResetTokenRepository {
  create(input: { adminUserId: number; tokenHash: string; expiresAt: Date }): Promise<void>;
  findValidByHash(tokenHash: string, now: Date): Promise<StoredPasswordResetToken | null>;
  markUsed(tokenHash: string, usedAt: Date): Promise<void>;
}

