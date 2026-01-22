import type { Request, Response } from "express";

export function getCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const parts = raw.split(";").map((p) => p.trim());
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    if (k === name) return decodeURIComponent(rest.join("=") || "");
  }
  return null;
}

export function setAuthCookies(
  res: Response,
  input: { accessToken: string; refreshToken: string; accessMaxAgeSeconds: number; refreshMaxAgeSeconds: number }
) {
  const secure = process.env.NODE_ENV === "production";

  res.cookie("admin_access_token", input.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: input.accessMaxAgeSeconds * 1000,
  });

  res.cookie("admin_refresh_token", input.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: input.refreshMaxAgeSeconds * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  const secure = process.env.NODE_ENV === "production";
  res.clearCookie("admin_access_token", { path: "/", httpOnly: true, secure, sameSite: "lax" });
  res.clearCookie("admin_refresh_token", { path: "/", httpOnly: true, secure, sameSite: "lax" });
}
