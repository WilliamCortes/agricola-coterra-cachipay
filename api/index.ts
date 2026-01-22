import { createApp } from "../server/app.js";

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appInstance) {
      const { app } = await createApp();
      appInstance = app;
    }
    
    appInstance(req, res);
  } catch (error: any) {
    console.error("Critical error in serverless function:", error);
    res.status(500).json({
      message: "Internal Server Error (Function Invocation Failed)",
      error: process.env.NODE_ENV === "production" ? "Check logs" : error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
}
