import test from "node:test";
import assert from "node:assert/strict";
import { LoginAdminUseCase } from "./LoginAdminUseCase";
import type { AdminUserRepository } from "../../domain/ports/AdminUserRepository";
import type { AdminRefreshTokenRepository } from "../../domain/ports/AdminRefreshTokenRepository";
import type { TokenService } from "../../domain/ports/TokenService";
import type { Clock } from "../../domain/ports/Clock";

test("LoginAdminUseCase issues tokens and refresh token is persisted", async () => {
  const adminUserRepository: AdminUserRepository = {
    async findByEmail(email) {
      if (email !== "admin@example.com") return null;
      return { id: 1, email, role: "admin" as any, isActive: true, passwordHash: "hash" };
    },
    async findById() {
      return null;
    },
    async updatePasswordHash() {},
  };

  let storedRefreshToken: { adminUserId: number; tokenHash: string; expiresAt: Date } | null = null;
  const refreshTokenRepository: AdminRefreshTokenRepository = {
    async create(input) {
      storedRefreshToken = input;
    },
    async findValidByHash() {
      return null;
    },
    async revokeByHash() {},
    async revokeAllForUser() {},
  };

  const tokenService: TokenService = {
    async signAccessToken() {
      return "access-token";
    },
    async verifyAccessToken() {
      throw new Error("not used");
    },
  };

  const clock: Clock = { now: () => new Date("2026-01-01T00:00:00.000Z") };

  const useCase = new LoginAdminUseCase(
    adminUserRepository,
    refreshTokenRepository,
    { verify: async () => true },
    tokenService,
    { generate: () => "refresh-token", hash: () => "refresh-token-hash" },
    clock,
    {
      accessTokenExpiresInSeconds: 900,
      refreshTokenExpiresInSeconds: { default: 3600, rememberMe: 7200 },
    }
  );

  const result = await useCase.execute({ email: "admin@example.com", password: "x", rememberMe: true });
  assert.equal(result.accessToken, "access-token");
  assert.equal(result.refreshToken, "refresh-token");
  assert.ok(storedRefreshToken);
  assert.equal(storedRefreshToken?.adminUserId, 1);
  assert.equal(storedRefreshToken?.tokenHash, "refresh-token-hash");
});

