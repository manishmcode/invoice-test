/**
 * @intent HTTP only: parse params, call the service, wrap the response.
 * @in Express request body and route id
 * @out JSON invoice and email envelopes
 * @not SQL, SMTP, file uploads
 */
import type { Request, Response } from "express";
import { parseDraft, parseEmailRequest } from "../../../database/models/InvoiceDraftSchema";
import type { InvoiceService } from "../services/InvoiceService";

export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /** GET /api/invoices — recent history, newest first, plus lastInvoice. */
  listInvoices = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.invoiceService.listInvoices();
    res.status(200).json(result);
  };

  /** GET /api/invoices/last — full most recently updated invoice. */
  getLastInvoice = async (_req: Request, res: Response): Promise<void> => {
    const invoice = await this.invoiceService.getLastInvoice();
    res.status(200).json({ invoice });
  };

  /** POST /api/invoices — parse the draft, persist recomputed totals, return 201. */
  createInvoice = async (req: Request, res: Response): Promise<void> => {
    const draft = parseDraft(req.body);
    const invoice = await this.invoiceService.createInvoice(draft);
    res.status(201).json({ invoice });
  };

  /** GET /api/invoices/:id — return the saved invoice, including hidden custom fields. */
  getInvoice = async (req: Request, res: Response): Promise<void> => {
    const invoice = await this.invoiceService.getInvoice(readRouteId(req));
    res.status(200).json({ invoice });
  };

  /** PUT /api/invoices/:id — full replace of draft fields; no upsert. */
  updateInvoice = async (req: Request, res: Response): Promise<void> => {
    const draft = parseDraft(req.body);
    const invoice = await this.invoiceService.updateInvoice(readRouteId(req), draft);
    res.status(200).json({ invoice });
  };

  /** POST /api/invoices/:id/email — send the persisted snapshot with an invoice PDF. */
  emailInvoice = async (req: Request, res: Response): Promise<void> => {
    const { to } = parseEmailRequest(req.body);
    const result = await this.invoiceService.emailInvoice(readRouteId(req), to);
    res.status(200).json(result);
  };
}

function readRouteId(req: Request): string {
  const id = req.params.id;
  return typeof id === "string" ? id : "";
}
