import { createApp } from "../server/app.js";
import { randomUUID } from "node:crypto";

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appInstance) {
      const { app } = await createApp();
      appInstance = app;
    }
    
    appInstance(req, res);
  } catch (error: any) {
    const requestId = String(req?.headers?.["x-request-id"] ?? req?.headers?.["x-vercel-id"] ?? randomUUID());
    try {
      res.setHeader("X-Request-Id", requestId);
    } catch {}

    console.error("Critical error in serverless function:", { requestId, error });
    res.status(500).json({
      message: "Internal Server Error",
      requestId,
      details: process.env.NODE_ENV === "production" ? undefined : String(error?.message ?? error),
    });
  }
}
