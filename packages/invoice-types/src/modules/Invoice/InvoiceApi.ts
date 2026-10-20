/**
 * @intent HTTP envelopes for invoice list, detail, and errors.
 * @in Invoice and InvoiceSummary
 * @out response and error types
 * @not file uploads
 */
import type { Invoice } from "./Invoice";
import type { InvoiceSummary } from "./InvoiceSummary";

export type InvoiceResponse = {
  invoice: Invoice;
};

export type InvoiceListResponse = {
  invoices: InvoiceSummary[];
  lastInvoice: InvoiceSummary | null;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};
