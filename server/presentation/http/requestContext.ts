import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

function resolveIncomingRequestId(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function createRequestContextMiddleware(): RequestHandler {
  return (req, res, next) => {
    const requestId =
      resolveIncomingRequestId(req.headers["x-request-id"]) ??
      resolveIncomingRequestId(req.headers["x-vercel-id"]) ??
      randomUUID();

    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    const start = Date.now();
    res.on("finish", () => {
      if (!req.path.startsWith("/api")) return;
      const durationMs = Date.now() - start;
      const line = JSON.stringify({
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      });
      console.log(line);
    });

    return next();
  };
}
