import { InvoiceEditorView } from "@/modules/Invoice/editor/InvoiceEditorView";

export async function generateMetadata(props: PageProps<"/invoices/[id]">) {
  const { id } = await props.params;
  return {
    title: `Invoice — Hearth & Ledger`,
    description: `Edit invoice ${id}.`,
  };
}

export default async function InvoicePage(props: PageProps<"/invoices/[id]">) {
  const { id } = await props.params;
  return <InvoiceEditorView invoiceId={id} />;
}
