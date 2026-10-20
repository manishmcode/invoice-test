import type { NextFunction, Request, Response } from "express";
import { EmailRateLimit, ErrorCode, ErrorMessage } from "../constants/ErrorCodes";
import { AppError } from "./AppError";

const hitsByIp = new Map<string, number[]>();

/** Limit POST /email to 5 attempts per minute per IP. */
export function rateLimitEmail(req: Request, _res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const recent = (hitsByIp.get(ip) ?? []).filter((stamp) => now - stamp < EmailRateLimit.windowMs);
  if (recent.length >= EmailRateLimit.maxHits) {
    next(new AppError(429, ErrorCode.RateLimited, ErrorMessage.RateLimited));
    return;
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  next();
}
