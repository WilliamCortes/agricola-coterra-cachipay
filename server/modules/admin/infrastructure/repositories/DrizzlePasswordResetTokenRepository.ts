import { db } from "../../../../db";
import { passwordResetTokens } from "@shared/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import type {
  PasswordResetTokenRepository,
  StoredPasswordResetToken,
} from "../../domain/ports/PasswordResetTokenRepository";

export class DrizzlePasswordResetTokenRepository implements PasswordResetTokenRepository {
  async create(input: { adminUserId: number; tokenHash: string; expiresAt: Date }): Promise<void> {
    await db.insert(passwordResetTokens).values({
      adminUserId: input.adminUserId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    });
  }

  async findValidByHash(tokenHash: string, now: Date): Promise<StoredPasswordResetToken | null> {
    const rows = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now)
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
      usedAt: row.usedAt ?? null,
    };
  }

  async markUsed(tokenHash: string, usedAt: Date): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt })
      .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)));
  }
}
