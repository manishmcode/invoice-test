import {
  CalculationError,
  calculateInvoice,
  fromCents,
  toCents,
  type CreateInvoiceBody,
  type InvoiceTotals,
} from "@hearth/invoice-types/modules/Invoice";

export function previewTotals(invoice: CreateInvoiceBody): InvoiceTotals {
  try {
    return calculateInvoice(invoice);
  } catch {
    const lineTotals = invoice.lineItems.map((line) => {
      if (!Number.isFinite(line.quantity) || !Number.isFinite(line.unitPrice) || line.quantity < 0 || line.unitPrice < 0) {
        return 0;
      }
      return fromCents(toCents(line.quantity * line.unitPrice));
    });
    return {
      lineTotals,
      subtotal: 0,
      discountAmount: invoice.discountAmount,
      taxAmount: 0,
      grandTotal: 0,
    };
  }
}

export function liveMoneyErrors(invoice: CreateInvoiceBody): Record<string, string> {
  try {
    calculateInvoice(invoice);
    return {};
  } catch (error) {
    if (error instanceof CalculationError) {
      return error.fields;
    }
    return {};
  }
}
