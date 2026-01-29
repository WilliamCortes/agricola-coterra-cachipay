import type { RequestHandler } from "express";

type SecurityOptions = {
  allowedOrigins: string[];
  isProduction: boolean;
};

function getCspValue() {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' https: data:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self' https:",
    "upgrade-insecure-requests",
  ];
  return directives.join("; ");
}

function isAllowedOrigin(origin: string, allowedOrigins: string[]) {
  return allowedOrigins.includes(origin);
}

export function createSecurityMiddleware(options: SecurityOptions): RequestHandler {
  const cspValue = options.isProduction ? getCspValue() : null;

  return (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");

    if (options.isProduction) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      if (cspValue) res.setHeader("Content-Security-Policy", cspValue);
    }

    if (req.path.startsWith("/api")) {
      res.setHeader("Cache-Control", "no-store");

      const origin = req.headers.origin;
      if (origin && isAllowedOrigin(origin, options.allowedOrigins)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
      }

      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        String(req.headers["access-control-request-headers"] ?? "Content-Type, Authorization"),
      );

      if (req.method === "OPTIONS") {
        return res.status(204).end();
      }
    }

    return next();
  };
}
