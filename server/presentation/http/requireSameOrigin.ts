import type { RequestHandler } from "express";

type RequireSameOriginOptions = {
  allowedOrigins: string[];
  isProduction: boolean;
};

function resolveRequestOrigin(headers: Record<string, unknown>) {
  const origin = typeof headers.origin === "string" ? headers.origin : null;
  if (origin) return origin;

  const referer = typeof headers.referer === "string" ? headers.referer : null;
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function createRequireSameOrigin(options: RequireSameOriginOptions): RequestHandler {
  const allowed = new Set(options.allowedOrigins);

  return (req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
      return next();
    }

    const origin = resolveRequestOrigin(req.headers as Record<string, unknown>);

    if (!origin) {
      if (!options.isProduction) return next();
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!allowed.has(origin)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}
