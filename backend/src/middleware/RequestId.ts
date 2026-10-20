import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

/** Attach a request id for correlation. Do not log bodies. */
export function requestId(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Request-Id", randomUUID());
  next();
}
