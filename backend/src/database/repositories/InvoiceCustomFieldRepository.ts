import type { DatabaseClient } from "../Database";
import type { InvoiceCustomField } from "../entities/InvoiceCustomField";
import { mapInvoiceCustomField, type InvoiceCustomFieldRow } from "../models/InvoiceRow";

const customFieldColumns = ["id", "invoice_id", "label", "value", "visible", "position"] as const;

export class InvoiceCustomFieldRepository {
  async listByInvoiceId(client: DatabaseClient, invoiceId: string): Promise<InvoiceCustomField[]> {
    const rows = await client<InvoiceCustomFieldRow>("invoice_custom_fields")
      .where({ invoice_id: invoiceId })
      .orderBy("position", "asc")
      .select(...customFieldColumns);
    return rows.map(mapInvoiceCustomField);
  }

  async replaceForInvoice(
    client: DatabaseClient,
    invoiceId: string,
    customFields: InvoiceCustomField[],
  ): Promise<void> {
    await client("invoice_custom_fields").where({ invoice_id: invoiceId }).del();
    if (customFields.length === 0) {
      return;
    }
    // SECURITY: column allow-list only. Never spread a request body into Knex.
    await client("invoice_custom_fields").insert(
      customFields.map((field, position) => ({
        id: field.id,
        invoice_id: invoiceId,
        label: field.label,
        value: field.value,
        visible: field.visible,
        position,
      })),
    );
  }
}
