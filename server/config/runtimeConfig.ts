import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  APP_BASE_URL: z.string().url().optional(),
  ADMIN_JWT_SECRET: z.string().min(16).optional(),
  ALLOWED_ORIGINS: z.string().optional(),
});

export type RuntimeConfig = {
  isProduction: boolean;
  databaseUrl: string | null;
  appBaseUrl: string | null;
  adminJwtSecret: string | null;
  allowedOrigins: string[];
};

function parseAllowedOrigins(input: string | null | undefined) {
  if (!input) return [];
  return input
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeBaseUrl(input: string): string | null {
  try {
    return new URL(input).origin;
  } catch {
    return null;
  }
}

function deriveAppBaseUrlFromVercelEnv(): string | null {
  const candidates = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const withProtocol = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const normalized = normalizeBaseUrl(withProtocol);
    if (normalized) return normalized;
  }

  return null;
}

export function getRuntimeConfig(): RuntimeConfig {
  const env = envSchema.parse(process.env);

  const isProduction = env.NODE_ENV === "production";
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);

  const config: RuntimeConfig = {
    isProduction,
    databaseUrl: env.DATABASE_URL ?? null,
    appBaseUrl: env.APP_BASE_URL ?? null,
    adminJwtSecret: env.ADMIN_JWT_SECRET ?? null,
    allowedOrigins,
  };

  if (!config.appBaseUrl) {
    const derived = deriveAppBaseUrlFromVercelEnv();
    if (derived) config.appBaseUrl = derived;
  }

  if (!config.appBaseUrl && config.allowedOrigins.length > 0) {
    const normalized = normalizeBaseUrl(config.allowedOrigins[0]);
    if (normalized) config.appBaseUrl = normalized;
  }

  if (isProduction) {
    if (!config.databaseUrl) throw new Error("DATABASE_URL is required in production");
    if (!config.appBaseUrl) throw new Error("APP_BASE_URL is required in production");
    if (!config.adminJwtSecret) throw new Error("ADMIN_JWT_SECRET is required in production");
    if (config.allowedOrigins.length === 0) config.allowedOrigins = [config.appBaseUrl];
  } else {
    if (config.allowedOrigins.length === 0 && config.appBaseUrl) config.allowedOrigins = [config.appBaseUrl];
  }

  config.allowedOrigins = Array.from(new Set(config.allowedOrigins));

  return config;
}
