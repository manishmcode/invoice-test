/**
 * @intent Mount invoice HTTP routes. Controllers stay HTTP-only.
 * @in InvoiceController
 * @out Express router for list, last, create, read, replace, email
 * @not file uploads
 */
import { Router } from "express";
import { asyncHandler } from "../../middleware/ErrorHandler";
import { rateLimitEmail } from "../../middleware/RateLimitEmail";
import type { InvoiceController } from "./controllers/InvoiceController";

export function createInvoiceRoutes(controller: InvoiceController): Router {
  const invoiceRoutes = Router();

  /** GET /api/invoices — recent invoices, newest first, plus lastInvoice. */
  invoiceRoutes.get("/", asyncHandler(controller.listInvoices));

  /** GET /api/invoices/last — full most recently updated invoice. */
  invoiceRoutes.get("/last", asyncHandler(controller.getLastInvoice));

  /** POST /api/invoices — create. Server assigns UUID and recomputes totals. */
  invoiceRoutes.post("/", asyncHandler(controller.createInvoice));

  /** GET /api/invoices/:id — load one persisted invoice, including hidden fields. */
  invoiceRoutes.get("/:id", asyncHandler(controller.getInvoice));

  /** PUT /api/invoices/:id — full replace of draft fields. 404 if missing (no upsert). */
  invoiceRoutes.put("/:id", asyncHandler(controller.updateInvoice));

  /** POST /api/invoices/:id/email — send the saved snapshot plus a PDF. Rate-limited; 503 if SMTP is unset. */
  invoiceRoutes.post("/:id/email", rateLimitEmail, asyncHandler(controller.emailInvoice));

  return invoiceRoutes;
}
