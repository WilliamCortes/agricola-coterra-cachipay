import type { RequestHandler } from "express";

type Bucket = { count: number; resetAt: number };

export function createSimpleRateLimit(options: {
  key: (req: Parameters<RequestHandler>[0]) => string;
  windowMs: number;
  max: number;
}): RequestHandler {
  const buckets = new Map<string, Bucket>();

  return (req, res, next) => {
    const now = Date.now();
    const key = options.key(req);
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (bucket.count >= options.max) {
      return res.status(429).json({ message: "Too many requests" });
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    return next();
  };
}

