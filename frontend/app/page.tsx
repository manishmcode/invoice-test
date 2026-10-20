import type { Metadata } from "next";
import { InvoicePortalPage } from "@/modules/Invoice/portal/InvoicePortalPage";

export const metadata: Metadata = {
  title: "Hearth & Ledger — Invoices",
  description: "Invoice ledger for a ceramics studio.",
};

export default function Page() {
  return <InvoicePortalPage />;
}
