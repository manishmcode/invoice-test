import type { LineItemInput } from "./InvoiceLineItem";

export type InvoiceTotals = {
  lineTotals: number[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
};

export type CalculateInput = {
  lineItems: LineItemInput[];
  discountAmount: number;
  taxRatePercent: number;
};
