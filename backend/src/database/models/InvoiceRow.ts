import type { InvoiceSummary } from "@hearth/invoice-types/modules/Invoice";
import type { InvoiceCustomField } from "../entities/InvoiceCustomField";
import type { InvoiceHeader } from "../entities/Invoice";
import type { InvoiceLineItem } from "../entities/InvoiceLineItem";
import type { InvoiceParty } from "../entities/InvoiceParty";

export type InvoiceHeaderRow = {
  id: string;
  number: string;
  issue_date: Date | string;
  due_date: Date | string;
  notes: string;
  discount_amount: string | number;
  tax_rate_percent: string | number;
  subtotal: string | number;
  tax_amount: string | number;
  grand_total: string | number;
  created_at: Date | string;
  updated_at: Date | string;
};

export type InvoicePartyRow = {
  id: string;
  invoice_id: string;
  role: string;
  name: string;
  address: string;
  email: string;
  phone: string | null;
};

export type InvoiceLineItemRow = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: string | number;
  unit_price: string | number;
  position: number;
};

export type InvoiceCustomFieldRow = {
  id: string;
  invoice_id: string;
  label: string;
  value: string;
  visible: boolean;
  position: number;
};

export type InvoiceSummaryRow = {
  id: string;
  number: string;
  customer_name: string | null;
  issue_date: Date | string;
  grand_total: string | number;
  updated_at: Date | string;
};

function asIsoDate(value: Date | string): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function asIsoTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

function asMoney(value: string | number): number {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function mapInvoiceHeader(row: InvoiceHeaderRow): InvoiceHeader {
  return {
    id: row.id,
    number: row.number,
    issueDate: asIsoDate(row.issue_date),
    dueDate: asIsoDate(row.due_date),
    notes: row.notes,
    discountAmount: asMoney(row.discount_amount),
    taxRatePercent: asMoney(row.tax_rate_percent),
    subtotal: asMoney(row.subtotal),
    taxAmount: asMoney(row.tax_amount),
    grandTotal: asMoney(row.grand_total),
    createdAt: asIsoTimestamp(row.created_at),
    updatedAt: asIsoTimestamp(row.updated_at),
  };
}

export function mapInvoiceParty(row: InvoicePartyRow): InvoiceParty {
  const role = row.role === "to" ? "to" : "from";
  return {
    role,
    name: row.name,
    address: row.address,
    email: row.email,
    phone: row.phone ?? "",
  };
}

export function mapInvoiceLineItem(row: InvoiceLineItemRow): InvoiceLineItem {
  return {
    id: row.id,
    description: row.description,
    quantity: asMoney(row.quantity),
    unitPrice: asMoney(row.unit_price),
  };
}

export function mapInvoiceCustomField(row: InvoiceCustomFieldRow): InvoiceCustomField {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    visible: Boolean(row.visible),
  };
}

export function mapInvoiceSummary(row: InvoiceSummaryRow): InvoiceSummary {
  return {
    id: row.id,
    number: row.number,
    customerName: row.customer_name ?? "",
    issueDate: asIsoDate(row.issue_date),
    grandTotal: asMoney(row.grand_total),
    updatedAt: asIsoTimestamp(row.updated_at),
  };
}
