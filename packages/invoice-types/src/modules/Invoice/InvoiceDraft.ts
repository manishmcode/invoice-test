import type { CustomField } from "./InvoiceCustomField";
import type { LineItem } from "./InvoiceLineItem";
import type { Business, Customer } from "./InvoiceParty";

export type InvoiceDraft = {
  number: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  business: Business;
  customer: Customer;
  lineItems: LineItem[];
  discountAmount: number;
  taxRatePercent: number;
  customFields: CustomField[];
};

export type CreateInvoiceBody = InvoiceDraft;
export type UpdateInvoiceBody = InvoiceDraft;
