export type StoredRefreshToken = {
  id: number;
  adminUserId: number;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

export interface AdminRefreshTokenRepository {
  create(input: { adminUserId: number; tokenHash: string; expiresAt: Date }): Promise<void>;
  findValidByHash(tokenHash: string, now: Date): Promise<StoredRefreshToken | null>;
  revokeByHash(tokenHash: string, revokedAt: Date): Promise<void>;
  revokeAllForUser(adminUserId: number, revokedAt: Date): Promise<void>;
}

