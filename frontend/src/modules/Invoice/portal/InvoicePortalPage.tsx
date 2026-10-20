"use client";

import Link from "next/link";
import { useState } from "react";
import { InvoicePreviewDialog } from "../components/InvoicePreviewDialog";
import { bannerClass, bannerErrorClass, btnPrimaryClass } from "../../../styles/Ui";
import { cx } from "../../../utils/Cx";
import { useInvoicePortal } from "../hooks/useInvoicePortal";
import { InvoiceList } from "./InvoiceList";
import { PortalHeader } from "./PortalHeader";
import styles from "./InvoicePortalPage.module.scss";

export function InvoicePortalPage() {
  const { invoices, loading, error } = useInvoicePortal();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [printWhenReady, setPrintWhenReady] = useState(false);
  const empty = !loading && invoices.length === 0 && !error;
  const selected = selectedId ?? invoices[0]?.id ?? null;

  function openPreview(id: string, print: boolean) {
    setSelectedId(id);
    setPreviewId(id);
    setPrintWhenReady(print);
  }

  return (
    <>
      <PortalHeader title="Invoices" />

      <main className={styles.main}>
        {error ? (
          <p className={bannerErrorClass} role="status">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className={bannerClass} role="status">
            Loading invoices…
          </p>
        ) : null}

        {empty ? (
          <section className={styles.empty} aria-labelledby="empty-heading">
            <h2 id="empty-heading" className={styles.emptyTitle}>
              No invoices yet
            </h2>
            <p className={styles.emptyCopy}>Create an invoice to start the studio ledger.</p>
            <Link className={cx(btnPrimaryClass, "inline-flex items-center")} href="/invoices/new">
              Create invoice
            </Link>
          </section>
        ) : null}

        {!loading && invoices.length > 0 ? (
          <InvoiceList
            invoices={invoices}
            selectedId={selected}
            onSelect={setSelectedId}
            onPreview={(id) => openPreview(id, false)}
            onPrint={(id) => openPreview(id, true)}
          />
        ) : null}
      </main>

      <InvoicePreviewDialog
        open={Boolean(previewId)}
        invoiceId={previewId}
        editHref={previewId ? `/invoices/${previewId}` : undefined}
        printWhenReady={printWhenReady}
        onClose={() => {
          setPreviewId(null);
          setPrintWhenReady(false);
        }}
      />
    </>
  );
}
