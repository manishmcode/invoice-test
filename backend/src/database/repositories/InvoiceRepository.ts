import type { Invoice, InvoiceSummary } from "@hearth/invoice-types/modules/Invoice";
import type { Knex } from "knex";
import { database, type DatabaseClient } from "../Database";
import type { InvoiceHeader } from "../entities/Invoice";
import {
  mapInvoiceHeader,
  mapInvoiceSummary,
  type InvoiceHeaderRow,
  type InvoiceSummaryRow,
} from "../models/InvoiceRow";

const headerConflictColumns = [
  "number",
  "issue_date",
  "due_date",
  "notes",
  "discount_amount",
  "tax_rate_percent",
  "subtotal",
  "tax_amount",
  "grand_total",
  "updated_at",
] as const;

export class InvoiceRepository {
  async withTransaction<T>(work: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return database.transaction(work);
  }

  async findHeader(client: DatabaseClient, id: string): Promise<InvoiceHeader | null> {
    const row = (await client("invoices")
      .where({ id })
      .select(
        "id",
        "number",
        client.raw("to_char(issue_date, 'YYYY-MM-DD') as issue_date"),
        client.raw("to_char(due_date, 'YYYY-MM-DD') as due_date"),
        "notes",
        "discount_amount",
        "tax_rate_percent",
        "subtotal",
        "tax_amount",
        "grand_total",
        "created_at",
        "updated_at",
      )
      .first()) as InvoiceHeaderRow | undefined;
    if (!row) {
      return null;
    }
    return mapInvoiceHeader(row);
  }

  async findLatestHeader(client: DatabaseClient): Promise<InvoiceHeader | null> {
    const row = (await client("invoices")
      .select(
        "id",
        "number",
        client.raw("to_char(issue_date, 'YYYY-MM-DD') as issue_date"),
        client.raw("to_char(due_date, 'YYYY-MM-DD') as due_date"),
        "notes",
        "discount_amount",
        "tax_rate_percent",
        "subtotal",
        "tax_amount",
        "grand_total",
        "created_at",
        "updated_at",
      )
      .orderBy("updated_at", "desc")
      .first()) as InvoiceHeaderRow | undefined;
    if (!row) {
      return null;
    }
    return mapInvoiceHeader(row);
  }

  async listSummaries(client: DatabaseClient, limit = 50): Promise<InvoiceSummary[]> {
    const rows = (await client("invoices")
      .leftJoin("invoice_parties", function joinCustomer() {
        this.on("invoice_parties.invoice_id", "=", "invoices.id").andOnVal(
          "invoice_parties.role",
          "=",
          "to",
        );
      })
      .select(
        "invoices.id as id",
        "invoices.number as number",
        "invoice_parties.name as customer_name",
        client.raw("to_char(invoices.issue_date, 'YYYY-MM-DD') as issue_date"),
        "invoices.grand_total as grand_total",
        "invoices.updated_at as updated_at",
      )
      .orderBy("invoices.updated_at", "desc")
      .limit(limit)) as InvoiceSummaryRow[];
    return rows.map(mapInvoiceSummary);
  }

  async upsertHeader(client: DatabaseClient, invoice: Invoice): Promise<void> {
    // SECURITY: column allow-list only. Never spread a request body into Knex.
    await client("invoices")
      .insert({
        id: invoice.id,
        number: invoice.number,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        notes: invoice.notes,
        discount_amount: invoice.discountAmount,
        tax_rate_percent: invoice.taxRatePercent,
        subtotal: invoice.totals.subtotal,
        tax_amount: invoice.totals.taxAmount,
        grand_total: invoice.totals.grandTotal,
        created_at: invoice.createdAt,
        updated_at: invoice.updatedAt,
      })
      .onConflict("id")
      .merge([...headerConflictColumns]);
  }
}
