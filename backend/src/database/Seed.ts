import { GoldenInvoiceId, OlderInvoiceId } from "../constants/ErrorCodes";
import { EmailAdapter } from "../adapters/EmailAdapter";
import { InvoiceCustomFieldRepository } from "./repositories/InvoiceCustomFieldRepository";
import { InvoiceLineItemRepository } from "./repositories/InvoiceLineItemRepository";
import { InvoicePartyRepository } from "./repositories/InvoicePartyRepository";
import { InvoiceRepository } from "./repositories/InvoiceRepository";
import { InvoiceService } from "../modules/Invoice/services/InvoiceService";
import { connectDatabase, database, disconnectDatabase } from "./Database";

function todayLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function createInvoiceService(): InvoiceService {
  return new InvoiceService(
    new InvoiceRepository(),
    new InvoicePartyRepository(),
    new InvoiceLineItemRepository(),
    new InvoiceCustomFieldRepository(),
    new EmailAdapter(),
  );
}

async function upsertDraft(
  invoiceService: InvoiceService,
  id: string,
  draft: Parameters<InvoiceService["createInvoice"]>[0],
): Promise<void> {
  const existing = await database("invoices").where({ id }).select("id").first();
  const invoice = existing
    ? await invoiceService.updateInvoice(id, draft)
    : await invoiceService.createInvoice(draft, id);
  console.log(`Seeded invoice ${invoice.id} ${invoice.number} (${invoice.totals.grandTotal} USD)`);
}

async function seed(): Promise<void> {
  await connectDatabase();

  const issueDate = todayLocal();
  const dueDate = addDays(issueDate, 14);
  const olderIssue = addDays(issueDate, -14);
  const invoiceService = createInvoiceService();

  await upsertDraft(invoiceService, OlderInvoiceId, {
    number: "HL-1031",
    issueDate: olderIssue,
    dueDate: addDays(olderIssue, 14),
    notes: "Fired ware for the inn dining room.",
    business: {
      name: "Hearth & Ledger",
      address: "18 Kiln Road\nHudson, NY 12534",
      email: "studio@hearthandledger.example",
      phone: "(518) 555-0142",
    },
    customer: {
      name: "River House Inn",
      address: "9 Bridge Street\nHudson, NY 12534",
      email: "hearthledger@yopmail.com",
    },
    lineItems: [
      {
        id: "e1a2b3c4-1111-4111-8111-000000000031",
        description: "Weekend tasting cups — set of 6",
        quantity: 2,
        unitPrice: 36,
      },
    ],
    discountAmount: 0,
    taxRatePercent: 0,
    customFields: [],
  });

  await upsertDraft(invoiceService, GoldenInvoiceId, {
    number: "HL-1042",
    issueDate,
    dueDate,
    notes: "Net 14. Crates ship freight collect.",
    business: {
      name: "Hearth & Ledger",
      address: "18 Kiln Road\nHudson, NY 12534",
      email: "studio@hearthandledger.example",
      phone: "(518) 555-0142",
    },
    customer: {
      name: "North Dock Gallery",
      address: "44 Water Street\nHudson, NY 12534",
      email: "hearthledger@yopmail.com",
    },
    lineItems: [
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        description: "Dinner plates, ash glaze — set of 8",
        quantity: 1,
        unitPrice: 50,
      },
      {
        id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        description: "Serving bowl, iron speckle",
        quantity: 1,
        unitPrice: 50,
      },
    ],
    discountAmount: 10,
    taxRatePercent: 10,
    customFields: [
      {
        id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        label: "Purchase order",
        value: "PO-8841",
        visible: true,
      },
      {
        id: "d4e5f6a7-b8c9-0123-def0-234567890123",
        label: "Internal job code",
        value: "KILN-22",
        visible: false,
      },
    ],
  });
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
