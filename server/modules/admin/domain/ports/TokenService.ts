import type { AdminUser } from "../entities/AdminUser";

export type AccessTokenPayload = {
  adminUserId: number;
  role: AdminUser["role"];
};

export interface TokenService {
  signAccessToken(payload: AccessTokenPayload, expiresInSeconds: number): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenPayload>;
}
