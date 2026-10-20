/**
 * Integer-cents invoice calculator used by both API and editor.
 * Order: round each line → sum subtotal → fixed discount → % tax on remainder.
 */

import type { InvoiceTotals, CalculateInput } from "./InvoiceTotals";

export class CalculationError extends Error {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super("Request is invalid");
    this.name = "CalculationError";
    this.fields = fields;
  }
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatUsd(amount: number): string {
  const cents = toCents(amount);
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = String(abs % 100).padStart(2, "0");
  return `${sign}$${dollars}.${remainder}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function calculateInvoice(input: CalculateInput): InvoiceTotals {
  const fields: Record<string, string> = {};

  if (!isFiniteNumber(input.discountAmount) || input.discountAmount < 0) {
    fields.discountAmount = "Discount cannot be negative";
  }
  if (!isFiniteNumber(input.taxRatePercent) || input.taxRatePercent < 0) {
    fields.taxRatePercent = "Tax rate cannot be negative";
  } else if (input.taxRatePercent > 100) {
    fields.taxRatePercent = "Tax rate cannot exceed 100";
  }

  input.lineItems.forEach((line, index) => {
    if (!isFiniteNumber(line.quantity) || line.quantity < 0) {
      fields[`lineItems.${index}.quantity`] = "Quantity cannot be negative";
    }
    if (!isFiniteNumber(line.unitPrice) || line.unitPrice < 0) {
      fields[`lineItems.${index}.unitPrice`] = "Price cannot be negative";
    }
  });

  if (Object.keys(fields).length > 0) {
    throw new CalculationError(fields);
  }

  const lineTotalCents = input.lineItems.map((line) => toCents(line.quantity * line.unitPrice));
  const subtotalCents = lineTotalCents.reduce((sum, cents) => sum + cents, 0);
  const discountCents = toCents(input.discountAmount);

  if (discountCents > subtotalCents) {
    throw new CalculationError({
      discountAmount: "Discount cannot exceed subtotal",
    });
  }

  const taxableCents = subtotalCents - discountCents;
  const taxCents = Math.round((taxableCents * input.taxRatePercent) / 100);
  const grandTotalCents = taxableCents + taxCents;

  return {
    lineTotals: lineTotalCents.map(fromCents),
    subtotal: fromCents(subtotalCents),
    discountAmount: fromCents(discountCents),
    taxAmount: fromCents(taxCents),
    grandTotal: fromCents(grandTotalCents),
  };
}
