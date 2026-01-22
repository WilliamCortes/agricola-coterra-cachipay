import { db } from "../../../../db";
import { adminRefreshTokens } from "@shared/schema";
import { and, eq, isNull, gt } from "drizzle-orm";
import type {
  AdminRefreshTokenRepository,
  StoredRefreshToken,
} from "../../domain/ports/AdminRefreshTokenRepository";

export class DrizzleAdminRefreshTokenRepository implements AdminRefreshTokenRepository {
  async create(input: { adminUserId: number; tokenHash: string; expiresAt: Date }): Promise<void> {
    await db.insert(adminRefreshTokens).values({
      adminUserId: input.adminUserId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    });
  }

  async findValidByHash(tokenHash: string, now: Date): Promise<StoredRefreshToken | null> {
    const rows = await db
      .select()
      .from(adminRefreshTokens)
      .where(
        and(
          eq(adminRefreshTokens.tokenHash, tokenHash),
          isNull(adminRefreshTokens.revokedAt),
          gt(adminRefreshTokens.expiresAt, now)
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      adminUserId: row.adminUserId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt ?? null,
    };
  }

  async revokeByHash(tokenHash: string, revokedAt: Date): Promise<void> {
    await db
      .update(adminRefreshTokens)
      .set({ revokedAt })
      .where(and(eq(adminRefreshTokens.tokenHash, tokenHash), isNull(adminRefreshTokens.revokedAt)));
  }

  async revokeAllForUser(adminUserId: number, revokedAt: Date): Promise<void> {
    await db
      .update(adminRefreshTokens)
      .set({ revokedAt })
      .where(and(eq(adminRefreshTokens.adminUserId, adminUserId), isNull(adminRefreshTokens.revokedAt)));
  }
}
