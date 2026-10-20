import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ErrorCode, ErrorMessage } from "../constants/ErrorCodes";
import { logError } from "../security/SafeLog";
import { zodToFields } from "../utils/ZodFields";
import { AppError } from "./AppError";

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/** Wrap async controllers so rejected promises reach the error handler. */
export function asyncHandler(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

/** Map domain errors to the contract envelope. Unexpected errors stay generic. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: ErrorCode.ValidationError,
        message: ErrorMessage.RequestInvalid,
        fields: zodToFields(err),
      },
    });
    return;
  }

  const expressErr = err as { type?: string; status?: number };
  if (expressErr.type === "entity.parse.failed" || expressErr.status === 400) {
    res.status(400).json({
      error: {
        code: ErrorCode.ValidationError,
        message: ErrorMessage.RequestInvalid,
      },
    });
    return;
  }

  if (expressErr.type === "entity.too.large" || expressErr.status === 413) {
    res.status(400).json({
      error: {
        code: ErrorCode.ValidationError,
        message: ErrorMessage.RequestInvalid,
      },
    });
    return;
  }

  logError("internal error", err);
  res.status(500).json({
    error: {
      code: ErrorCode.InternalError,
      message: ErrorMessage.InternalError,
    },
  });
};
