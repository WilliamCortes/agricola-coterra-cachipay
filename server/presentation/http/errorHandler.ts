import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

function getStatusCode(error: unknown) {
  const err: any = error;
  const candidate = err?.status ?? err?.statusCode;
  return Number.isFinite(candidate) ? Number(candidate) : 500;
}

function getMessage(error: unknown) {
  const err: any = error;
  if (typeof err?.message === "string" && err.message.trim().length > 0) return err.message;
  return "Internal Server Error";
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const requestId = req.requestId ?? String(res.getHeader("X-Request-Id") ?? "");

  if (error instanceof ZodError) {
    const first = error.errors[0];
    return res.status(400).json({
      message: first?.message ?? "Invalid request",
      field: first?.path?.length ? first.path.join(".") : undefined,
      requestId: requestId || undefined,
    });
  }

  const statusCode = getStatusCode(error);

  const message =
    statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : getMessage(error);

  console.error("Request failed", { requestId: requestId || undefined, statusCode, error });

  return res.status(statusCode).json({
    message,
    requestId: requestId || undefined,
  });
};
