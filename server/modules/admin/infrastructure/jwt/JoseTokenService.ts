import { SignJWT, jwtVerify } from "jose";
import type { TokenService, AccessTokenPayload } from "../../domain/ports/TokenService";

export class JoseTokenService implements TokenService {
  constructor(private readonly secret: string) {}

  private getKey() {
    return new TextEncoder().encode(this.secret);
  }

  async signAccessToken(payload: AccessTokenPayload, expiresInSeconds: number): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ role: payload.role })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(String(payload.adminUserId))
      .setIssuedAt(now)
      .setExpirationTime(now + expiresInSeconds)
      .sign(this.getKey());
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, this.getKey(), { algorithms: ["HS256"] });
    const sub = payload.sub;
    const role = payload.role;
    if (typeof sub !== "string" || !sub) {
      const err = new Error("Unauthorized");
      (err as any).status = 401;
      throw err;
    }
    if (typeof role !== "string" || !role) {
      const err = new Error("Unauthorized");
      (err as any).status = 401;
      throw err;
    }
    return { adminUserId: Number(sub), role: role as any };
  }
}
