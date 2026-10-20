import type { CreateInvoiceBody } from "@hearth/invoice-types/modules/Invoice";
import { demoMailInbox } from "./DemoMail";

export function todayLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function nextInvoiceNumber(): string {
  return `HL-${todayLocal().replaceAll("-", "").slice(2)}`;
}

export function createNewInvoice(): CreateInvoiceBody {
  const seed = createSeedInvoice();
  return {
    ...seed,
    number: nextInvoiceNumber(),
    lineItems: seed.lineItems.map((line) => ({ ...line, id: crypto.randomUUID() })),
    customFields: seed.customFields.map((field) => ({ ...field, id: crypto.randomUUID() })),
  };
}

export function createSeedInvoice(): CreateInvoiceBody {
  const issueDate = todayLocal();
  return {
    number: "HL-1042",
    issueDate,
    dueDate: addDays(issueDate, 14),
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
      email: demoMailInbox,
    },
    lineItems: [
      {
        id: "c0a1e7d0-1111-4111-8111-000000000001",
        description: "Dinner plates, ash glaze — set of 8",
        quantity: 1,
        unitPrice: 50,
      },
      {
        id: "c0a1e7d0-1111-4111-8111-000000000002",
        description: "Serving bowl, iron speckle",
        quantity: 1,
        unitPrice: 50,
      },
    ],
    discountAmount: 10,
    taxRatePercent: 10,
    customFields: [
      {
        id: "c0a1e7d0-2222-4222-8222-000000000001",
        label: "Purchase order",
        value: "PO-8841",
        visible: true,
      },
      {
        id: "c0a1e7d0-2222-4222-8222-000000000002",
        label: "Internal job code",
        value: "KILN-22",
        visible: false,
      },
    ],
  };
}
