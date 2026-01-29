import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";
import { createSecurityMiddleware } from "./presentation/http/security.js";
import { createRequireSameOrigin } from "./presentation/http/requireSameOrigin.js";
import { createRequestContextMiddleware } from "./presentation/http/requestContext.js";
import { errorHandler } from "./presentation/http/errorHandler.js";
import { getRuntimeConfig } from "./config/runtimeConfig.js";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function createApp() {
  const app = express();
  const httpServer = createServer(app);

  app.disable("x-powered-by");

  const runtimeConfig = getRuntimeConfig();

  app.use(createRequestContextMiddleware());

  app.use(
    createSecurityMiddleware({
      allowedOrigins: runtimeConfig.allowedOrigins,
      isProduction: runtimeConfig.isProduction,
    }),
  );

  app.use(
    "/api/admin",
    createRequireSameOrigin({
      allowedOrigins: runtimeConfig.allowedOrigins,
      isProduction: runtimeConfig.isProduction,
    }),
  );

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));

  await registerRoutes(app, httpServer);

  app.use(errorHandler);

  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    serveStatic(app);
  } else if (process.env.NODE_ENV !== "production") {
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  return { app, httpServer };
}
