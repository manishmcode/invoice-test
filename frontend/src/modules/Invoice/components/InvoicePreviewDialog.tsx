"use client";

import type { InvoiceDraft, InvoiceTotals } from "@hearth/invoice-types/modules/Invoice";
import Link from "next/link";
import { useEffect, useState } from "react";
import { btnAccentClass, btnPrimaryClass } from "../../../styles/Ui";
import { cx } from "../../../utils/Cx";
import { ApiError, getInvoice } from "../services/InvoiceApi";
import { previewTotals } from "../utils/PreviewTotals";
import { InvoicePreview } from "./InvoicePreview";
import styles from "./InvoicePreviewDialog.module.scss";

type InvoicePreviewDialogProps = {
  open: boolean;
  invoiceId?: string | null;
  draft?: InvoiceDraft | null;
  totals?: InvoiceTotals;
  editHref?: string;
  printWhenReady?: boolean;
  onClose: () => void;
};

export function InvoicePreviewDialog({
  open,
  invoiceId,
  draft,
  totals,
  editHref,
  printWhenReady,
  onClose,
}: InvoicePreviewDialogProps) {
  const [loaded, setLoaded] = useState<InvoiceDraft | null>(draft ?? null);
  const [loadedTotals, setLoadedTotals] = useState<InvoiceTotals | null>(totals ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (draft) {
      setLoaded(draft);
      setLoadedTotals(totals ?? previewTotals(draft));
      setError(null);
      setLoading(false);
      return;
    }

    if (!invoiceId) {
      setLoaded(null);
      setError("No invoice selected.");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getInvoice(invoiceId, controller.signal)
      .then((invoice) => {
        setLoaded(invoice);
        setLoadedTotals(invoice.totals);
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setError(caught instanceof ApiError || caught instanceof Error ? caught.message : "Could not load preview.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [open, invoiceId, draft, totals]);

  useEffect(() => {
    if (!open || !printWhenReady || !loaded || loading) {
      return;
    }
    const timer = window.setTimeout(() => window.print(), 50);
    return () => window.clearTimeout(timer);
  }, [open, printWhenReady, loaded, loading]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={cx("no-print", styles.header)}>
          <h2 id="preview-title" className={styles.title}>
            Preview
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles.stage}>
          {loading ? <p className={cx("no-print", styles.status)}>Loading preview…</p> : null}
          {error ? (
            <p className={cx("no-print", styles.status)} role="status">
              {error}
            </p>
          ) : null}
          {loaded && loadedTotals ? <InvoicePreview invoice={loaded} totals={loadedTotals} /> : null}
        </div>
        <div className={cx("no-print", styles.footer)}>
          {editHref ? (
            <Link className={btnAccentClass} href={editHref}>
              Open
            </Link>
          ) : null}
          <button type="button" className={btnPrimaryClass} onClick={() => window.print()} disabled={!loaded}>
            Print / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
