import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { DrizzleAdminUserRepository } from "../infrastructure/repositories/DrizzleAdminUserRepository.js";
import { DrizzleAdminRefreshTokenRepository } from "../infrastructure/repositories/DrizzleAdminRefreshTokenRepository.js";
import { DrizzlePasswordResetTokenRepository } from "../infrastructure/repositories/DrizzlePasswordResetTokenRepository.js";
import { ScryptPasswordHasher } from "../infrastructure/crypto/ScryptPasswordHasher.js";
import { TokenGenerator } from "../infrastructure/crypto/TokenGenerator.js";
import { JoseTokenService } from "../infrastructure/jwt/JoseTokenService.js";
import { SystemClock } from "../infrastructure/clock/SystemClock.js";
import { NodemailerEmailSender } from "../infrastructure/email/NodemailerEmailSender.js";
import { LoginAdminUseCase } from "../application/useCases/LoginAdminUseCase.js";
import { RefreshAdminSessionUseCase } from "../application/useCases/RefreshAdminSessionUseCase.js";
import { LogoutAdminUseCase } from "../application/useCases/LogoutAdminUseCase.js";
import { GetCurrentAdminUseCase } from "../application/useCases/GetCurrentAdminUseCase.js";
import { RequestPasswordResetUseCase } from "../application/useCases/RequestPasswordResetUseCase.js";
import { ResetPasswordUseCase } from "../application/useCases/ResetPasswordUseCase.js";
import { clearAuthCookies, getCookie, setAuthCookies } from "./http/cookies.js";
import { createSimpleRateLimit } from "./http/rateLimit.js";
import { createRequireAdminAuth } from "./http/requireAdminAuth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

function getAppBaseUrl() {
  const explicit = process.env.APP_BASE_URL;
  if (explicit) return explicit;

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:5000";
}

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || null;
}

function getNumberFromEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL;

  if (!host || !portRaw || !user || !pass || !fromEmail) return null;
  return { host, port: Number(portRaw), user, pass, fromEmail };
}

export function registerAdminAuthRoutes(app: Express) {
  const router = express.Router();

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    router.use((_req, res) => {
      return res.status(503).json({ message: "Admin authentication is not configured" });
    });
    app.use("/api/admin/auth", router);
    return;
  }

  const adminUserRepository = new DrizzleAdminUserRepository();
  const refreshTokenRepository = new DrizzleAdminRefreshTokenRepository();
  const passwordResetTokenRepository = new DrizzlePasswordResetTokenRepository();
  const passwordHasher = new ScryptPasswordHasher();
  const tokenGenerator = new TokenGenerator();
  const tokenService = new JoseTokenService(jwtSecret);
  const clock = new SystemClock();
  const smtp = getSmtpConfig();
  const emailSender = smtp ? new NodemailerEmailSender(smtp) : null;

  const accessTokenExpiresInSeconds = getNumberFromEnv("ADMIN_ACCESS_TOKEN_TTL_SECONDS", 60 * 15);
  const refreshTokenTtlDefaultSeconds = getNumberFromEnv("ADMIN_REFRESH_TOKEN_TTL_SECONDS", 60 * 60 * 24);
  const refreshTokenTtlRememberMeSeconds = getNumberFromEnv(
    "ADMIN_REFRESH_TOKEN_TTL_REMEMBER_ME_SECONDS",
    60 * 60 * 24 * 30
  );

  const loginUseCase = new LoginAdminUseCase(
    adminUserRepository,
    refreshTokenRepository,
    passwordHasher,
    tokenService,
    tokenGenerator,
    clock,
    {
      accessTokenExpiresInSeconds,
      refreshTokenExpiresInSeconds: {
        default: refreshTokenTtlDefaultSeconds,
        rememberMe: refreshTokenTtlRememberMeSeconds,
      },
    }
  );

  const refreshUseCase = new RefreshAdminSessionUseCase(
    adminUserRepository,
    refreshTokenRepository,
    tokenService,
    tokenGenerator,
    clock,
    {
      accessTokenExpiresInSeconds,
      refreshTokenExpiresInSeconds: refreshTokenTtlRememberMeSeconds,
    }
  );

  const logoutUseCase = new LogoutAdminUseCase(refreshTokenRepository, clock, tokenGenerator);
  const getMeUseCase = new GetCurrentAdminUseCase(tokenService, adminUserRepository);
  const requireAdminAuth = createRequireAdminAuth(tokenService);

  const requestResetUseCase = emailSender
    ? new RequestPasswordResetUseCase(
        adminUserRepository,
        passwordResetTokenRepository,
        emailSender,
        tokenGenerator,
        clock,
        getAppBaseUrl()
      )
    : null;

  const resetPasswordUseCase = new ResetPasswordUseCase(
    adminUserRepository,
    refreshTokenRepository,
    passwordResetTokenRepository,
    passwordHasher,
    tokenGenerator,
    clock
  );

  router.post(
    "/login",
    createSimpleRateLimit({
      key: (req) => `${req.ip}:${String(req.body?.email || "")}`.toLowerCase(),
      windowMs: 60_000,
      max: 10,
    }),
    async (req, res, next) => {
      try {
        const input = loginSchema.parse(req.body);
        const result = await loginUseCase.execute(input);
        const refreshMaxAgeSeconds = input.rememberMe
          ? refreshTokenTtlRememberMeSeconds
          : refreshTokenTtlDefaultSeconds;
        setAuthCookies(res, {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          accessMaxAgeSeconds: accessTokenExpiresInSeconds,
          refreshMaxAgeSeconds,
        });
        return res.json({ user: result.user });
      } catch (err) {
        return next(err);
      }
    }
  );

  router.post("/refresh", async (req, res, next) => {
    try {
      const refreshToken = getCookie(req, "admin_refresh_token");
      if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });
      const result = await refreshUseCase.execute(refreshToken);
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        accessMaxAgeSeconds: accessTokenExpiresInSeconds,
        refreshMaxAgeSeconds: refreshTokenTtlRememberMeSeconds,
      });
      return res.json({ user: result.user });
    } catch (err) {
      return next(err);
    }
  });

  router.post("/logout", async (req, res, next) => {
    try {
      const refreshToken = getCookie(req, "admin_refresh_token");
      await logoutUseCase.execute(refreshToken);
      clearAuthCookies(res);
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  });

  router.get("/me", async (req, res, next) => {
    try {
      const accessToken = getCookie(req, "admin_access_token");
      if (!accessToken) return res.status(401).json({ message: "Unauthorized" });
      const user = await getMeUseCase.execute(accessToken);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  });

  router.get("/ping", requireAdminAuth, async (_req, res) => {
    return res.json({ ok: true });
  });

  router.post(
    "/forgot-password",
    createSimpleRateLimit({ key: (req) => `${req.ip}`, windowMs: 60_000, max: 5 }),
    async (req, res, next) => {
      try {
        const input = forgotSchema.parse(req.body);
        if (!requestResetUseCase) {
          return res.status(500).json({ message: "Email is not configured" });
        }
        await requestResetUseCase.execute(input.email);
        return res.json({ success: true });
      } catch (err) {
        return next(err);
      }
    }
  );

  router.post("/reset-password", async (req, res, next) => {
    try {
      const input = resetSchema.parse(req.body);
      await resetPasswordUseCase.execute({ token: input.token, newPassword: input.password });
      clearAuthCookies(res);
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  });

  app.use("/api/admin/auth", router);
}
