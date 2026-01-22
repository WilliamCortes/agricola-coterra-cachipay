import type { RequestHandler } from "express";
import { getCookie } from "./cookies";
import type { TokenService } from "../../domain/ports/TokenService";

declare module "express-serve-static-core" {
  interface Request {
    admin?: { adminUserId: number; role: string };
  }
}

export function createRequireAdminAuth(tokenService: TokenService): RequestHandler {
  return async (req, res, next) => {
    try {
      const token = getCookie(req, "admin_access_token");
      if (!token) return res.status(401).json({ message: "Unauthorized" });
      const payload = await tokenService.verifyAccessToken(token);
      req.admin = { adminUserId: payload.adminUserId, role: payload.role };
      return next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}
