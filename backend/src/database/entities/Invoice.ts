import type { CreateInvoiceBody } from "@hearth/invoice-types/modules/Invoice";
import type { InvoiceCustomField } from "./InvoiceCustomField";
import type { InvoiceLineItem } from "./InvoiceLineItem";
import type { InvoiceParty } from "./InvoiceParty";

/** Persisted invoice header. Totals here are snapshots; the service recomputes them. */
export type InvoiceHeader = {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  discountAmount: number;
  taxRatePercent: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
};

/** Rebuild the shared draft from related rows. Throws if a from/to party is missing. */
export function assembleInvoiceDraft(input: {
  header: InvoiceHeader;
  parties: InvoiceParty[];
  lineItems: InvoiceLineItem[];
  customFields: InvoiceCustomField[];
}): CreateInvoiceBody {
  const from = input.parties.find((party) => party.role === "from");
  const to = input.parties.find((party) => party.role === "to");
  if (!from || !to) {
    throw new Error("Invoice is missing a from or to party");
  }

  return {
    number: input.header.number,
    issueDate: input.header.issueDate,
    dueDate: input.header.dueDate,
    notes: input.header.notes,
    business: {
      name: from.name,
      address: from.address,
      email: from.email,
      phone: from.phone,
    },
    customer: {
      name: to.name,
      address: to.address,
      email: to.email,
    },
    lineItems: input.lineItems,
    discountAmount: input.header.discountAmount,
    taxRatePercent: input.header.taxRatePercent,
    customFields: input.customFields,
  };
}
