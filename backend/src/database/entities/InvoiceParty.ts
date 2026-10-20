import type {
  CreateInvoiceBody,
  Invoice,
  InvoiceParty,
  InvoicePartyRole,
} from "@hearth/invoice-types/modules/Invoice";

export type { InvoiceParty, InvoicePartyRole };

/** Flatten business + customer on the shared invoice into two party rows. */
export function partiesFromInvoice(invoice: Invoice | CreateInvoiceBody): InvoiceParty[] {
  return [
    {
      role: "from" satisfies InvoicePartyRole,
      name: invoice.business.name,
      address: invoice.business.address,
      email: invoice.business.email,
      phone: invoice.business.phone,
    },
    {
      role: "to" satisfies InvoicePartyRole,
      name: invoice.customer.name,
      address: invoice.customer.address,
      email: invoice.customer.email,
      phone: "",
    },
  ];
}
