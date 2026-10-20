export const ErrorCode = {
  ValidationError: "VALIDATION_ERROR",
  NotFound: "NOT_FOUND",
  EmailNotAllowed: "EMAIL_NOT_ALLOWED",
  RateLimited: "RATE_LIMITED",
  EmailUnconfigured: "EMAIL_UNCONFIGURED",
  InternalError: "INTERNAL_ERROR",
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorMessage = {
  RequestInvalid: "Request is invalid",
  InvoiceNotFound: "Invoice not found",
  EmailNotAllowed: "Recipient is not on the allowlist",
  RateLimited: "Too many email attempts. Try again shortly.",
  EmailUnconfigured: "Mail is not configured. See README.",
  InternalError: "An unexpected error occurred",
} as const;

export const EmailRateLimit = {
  windowMs: 60_000,
  maxHits: 5,
} as const;

export const GoldenInvoiceId = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
export const OlderInvoiceId = "2a8f0c3e-1b47-4d2a-9c11-6e4f8a0b1d22";

export const UuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
