import type { AdminRefreshTokenRepository } from "../../domain/ports/AdminRefreshTokenRepository";
import type { Clock } from "../../domain/ports/Clock";

export class LogoutAdminUseCase {
  constructor(
    private readonly refreshTokenRepository: AdminRefreshTokenRepository,
    private readonly clock: Clock,
    private readonly tokenHasher: { hash(token: string): string }
  ) {}

  async execute(refreshToken: string | null): Promise<void> {
    if (!refreshToken) return;
    await this.refreshTokenRepository.revokeByHash(this.tokenHasher.hash(refreshToken), this.clock.now());
  }
}
