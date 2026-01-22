import type { AdminUserRepository } from "../../domain/ports/AdminUserRepository";
import type { TokenService } from "../../domain/ports/TokenService";

export class GetCurrentAdminUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly adminUserRepository: AdminUserRepository
  ) {}

  async execute(accessToken: string) {
    const payload = await this.tokenService.verifyAccessToken(accessToken);
    const adminUser = await this.adminUserRepository.findById(payload.adminUserId);
    if (!adminUser || !adminUser.isActive) {
      const err = new Error("Unauthorized");
      (err as any).status = 401;
      throw err;
    }
    return adminUser;
  }
}
