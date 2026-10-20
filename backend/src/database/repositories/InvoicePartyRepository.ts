import { randomUUID } from "node:crypto";
import type { DatabaseClient } from "../Database";
import type { InvoiceParty } from "../entities/InvoiceParty";
import { mapInvoiceParty, type InvoicePartyRow } from "../models/InvoiceRow";

const partyColumns = ["id", "invoice_id", "role", "name", "address", "email", "phone"] as const;

export class InvoicePartyRepository {
  async listByInvoiceId(client: DatabaseClient, invoiceId: string): Promise<InvoiceParty[]> {
    const rows = await client<InvoicePartyRow>("invoice_parties")
      .where({ invoice_id: invoiceId })
      .select(...partyColumns);
    return rows.map(mapInvoiceParty);
  }

  async replaceForInvoice(
    client: DatabaseClient,
    invoiceId: string,
    parties: InvoiceParty[],
  ): Promise<void> {
    await client("invoice_parties").where({ invoice_id: invoiceId }).del();
    if (parties.length === 0) {
      return;
    }
    // SECURITY: column allow-list only. Never spread a request body into Knex.
    await client("invoice_parties").insert(
      parties.map((party) => ({
        id: randomUUID(),
        invoice_id: invoiceId,
        role: party.role,
        name: party.name,
        address: party.address,
        email: party.email,
        phone: party.phone,
      })),
    );
  }
}
