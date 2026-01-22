import type { AdminUser } from "../../domain/entities/AdminUser";
import type { AdminUserRepository } from "../../domain/ports/AdminUserRepository";
import type { AdminRefreshTokenRepository } from "../../domain/ports/AdminRefreshTokenRepository";
import type { Clock } from "../../domain/ports/Clock";
import type { TokenService } from "../../domain/ports/TokenService";

export type RandomTokenGenerator = {
  generate(): string;
  hash(token: string): string;
};

export type RefreshAdminSessionOutput = {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
};

export class RefreshAdminSessionUseCase {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly refreshTokenRepository: AdminRefreshTokenRepository,
    private readonly tokenService: TokenService,
    private readonly randomTokenGenerator: RandomTokenGenerator,
    private readonly clock: Clock,
    private readonly config: { accessTokenExpiresInSeconds: number; refreshTokenExpiresInSeconds: number }
  ) {}

  async execute(refreshToken: string): Promise<RefreshAdminSessionOutput> {
    const now = this.clock.now();
    const refreshTokenHash = this.randomTokenGenerator.hash(refreshToken);
    const stored = await this.refreshTokenRepository.findValidByHash(refreshTokenHash, now);
    if (!stored) {
      const err = new Error("Unauthorized");
      (err as any).status = 401;
      throw err;
    }

    const adminUser = await this.adminUserRepository.findById(stored.adminUserId);
    if (!adminUser || !adminUser.isActive) {
      await this.refreshTokenRepository.revokeByHash(refreshTokenHash, now);
      const err = new Error("Unauthorized");
      (err as any).status = 401;
      throw err;
    }

    await this.refreshTokenRepository.revokeByHash(refreshTokenHash, now);

    const accessToken = await this.tokenService.signAccessToken(
      { adminUserId: adminUser.id, role: adminUser.role },
      this.config.accessTokenExpiresInSeconds
    );

    const newRefreshToken = this.randomTokenGenerator.generate();
    const newRefreshTokenHash = this.randomTokenGenerator.hash(newRefreshToken);
    const refreshTokenExpiresInSeconds = this.config.refreshTokenExpiresInSeconds;

    await this.refreshTokenRepository.create({
      adminUserId: adminUser.id,
      tokenHash: newRefreshTokenHash,
      expiresAt: new Date(now.getTime() + refreshTokenExpiresInSeconds * 1000),
    });

    return { user: adminUser, accessToken, refreshToken: newRefreshToken };
  }
}
