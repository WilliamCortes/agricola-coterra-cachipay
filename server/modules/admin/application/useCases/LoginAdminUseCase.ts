import type { AdminUser } from "../../domain/entities/AdminUser";
import type { AdminUserRepository } from "../../domain/ports/AdminUserRepository";
import type { AdminRefreshTokenRepository } from "../../domain/ports/AdminRefreshTokenRepository";
import type { Clock } from "../../domain/ports/Clock";
import type { TokenService } from "../../domain/ports/TokenService";

export type PasswordHasher = {
  verify(plain: string, passwordHash: string): Promise<boolean>;
};

export type RandomTokenGenerator = {
  generate(): string;
  hash(token: string): string;
};

export type LoginAdminInput = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type LoginAdminOutput = {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
};

export class LoginAdminUseCase {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly refreshTokenRepository: AdminRefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly randomTokenGenerator: RandomTokenGenerator,
    private readonly clock: Clock,
    private readonly config: {
      accessTokenExpiresInSeconds: number;
      refreshTokenExpiresInSeconds: { default: number; rememberMe: number };
    }
  ) {}

  async execute(input: LoginAdminInput): Promise<LoginAdminOutput> {
    const email = input.email.trim().toLowerCase();
    const adminUser = await this.adminUserRepository.findByEmail(email);
    if (!adminUser || !adminUser.isActive) {
      const err = new Error("Invalid credentials");
      (err as any).status = 401;
      throw err;
    }

    const ok = await this.passwordHasher.verify(input.password, adminUser.passwordHash);
    if (!ok) {
      const err = new Error("Invalid credentials");
      (err as any).status = 401;
      throw err;
    }

    const accessToken = await this.tokenService.signAccessToken(
      { adminUserId: adminUser.id, role: adminUser.role },
      this.config.accessTokenExpiresInSeconds
    );

    const refreshToken = this.randomTokenGenerator.generate();
    const refreshTokenHash = this.randomTokenGenerator.hash(refreshToken);
    const refreshTokenExpiresInSeconds = input.rememberMe
      ? this.config.refreshTokenExpiresInSeconds.rememberMe
      : this.config.refreshTokenExpiresInSeconds.default;

    await this.refreshTokenRepository.create({
      adminUserId: adminUser.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(this.clock.now().getTime() + refreshTokenExpiresInSeconds * 1000),
    });

    return {
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
      },
      accessToken,
      refreshToken,
    };
  }
}
