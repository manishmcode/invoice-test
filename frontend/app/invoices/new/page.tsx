import type { Metadata } from "next";
import { InvoiceEditorView } from "@/modules/Invoice/editor/InvoiceEditorView";

export const metadata: Metadata = {
  title: "New invoice — Hearth & Ledger",
  description: "Create a ceramics studio invoice.",
};

export default function NewInvoicePage() {
  return <InvoiceEditorView invoiceId={null} />;
}
