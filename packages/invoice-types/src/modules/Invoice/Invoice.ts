/**
 * @intent Saved invoice shape returned by the API.
 * @in draft fields plus server id, totals, timestamps
 * @out Invoice
 * @not file uploads
 */
import type { InvoiceDraft } from "./InvoiceDraft";
import type { InvoiceTotals } from "./InvoiceTotals";

export type Invoice = InvoiceDraft & {
  id: string;
  totals: InvoiceTotals;
  createdAt: string;
  updatedAt: string;
};
