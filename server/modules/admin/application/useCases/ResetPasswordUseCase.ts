import type { AdminUserRepository } from "../../domain/ports/AdminUserRepository";
import type { AdminRefreshTokenRepository } from "../../domain/ports/AdminRefreshTokenRepository";
import type { PasswordResetTokenRepository } from "../../domain/ports/PasswordResetTokenRepository";
import type { Clock } from "../../domain/ports/Clock";

export type PasswordHasher = {
  hash(plain: string): Promise<string>;
};

export class ResetPasswordUseCase {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly refreshTokenRepository: AdminRefreshTokenRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenHasher: { hash(token: string): string },
    private readonly clock: Clock
  ) {}

  async execute(input: { token: string; newPassword: string }): Promise<void> {
    const now = this.clock.now();
    const tokenHash = this.tokenHasher.hash(input.token);
    const stored = await this.passwordResetTokenRepository.findValidByHash(tokenHash, now);
    if (!stored) {
      const err = new Error("Invalid or expired token");
      (err as any).status = 400;
      throw err;
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.adminUserRepository.updatePasswordHash(stored.adminUserId, passwordHash);
    await this.passwordResetTokenRepository.markUsed(tokenHash, now);
    await this.refreshTokenRepository.revokeAllForUser(stored.adminUserId, now);
  }
}
