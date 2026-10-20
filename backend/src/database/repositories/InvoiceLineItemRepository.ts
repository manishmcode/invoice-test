import type { DatabaseClient } from "../Database";
import type { InvoiceLineItem } from "../entities/InvoiceLineItem";
import { mapInvoiceLineItem, type InvoiceLineItemRow } from "../models/InvoiceRow";

const lineItemColumns = ["id", "invoice_id", "description", "quantity", "unit_price", "position"] as const;

export class InvoiceLineItemRepository {
  async listByInvoiceId(client: DatabaseClient, invoiceId: string): Promise<InvoiceLineItem[]> {
    const rows = await client<InvoiceLineItemRow>("invoice_line_items")
      .where({ invoice_id: invoiceId })
      .orderBy("position", "asc")
      .select(...lineItemColumns);
    return rows.map(mapInvoiceLineItem);
  }

  async replaceForInvoice(
    client: DatabaseClient,
    invoiceId: string,
    lineItems: InvoiceLineItem[],
  ): Promise<void> {
    await client("invoice_line_items").where({ invoice_id: invoiceId }).del();
    if (lineItems.length === 0) {
      return;
    }
    // SECURITY: column allow-list only. Never spread a request body into Knex.
    await client("invoice_line_items").insert(
      lineItems.map((line, position) => ({
        id: line.id,
        invoice_id: invoiceId,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        position,
      })),
    );
  }
}
