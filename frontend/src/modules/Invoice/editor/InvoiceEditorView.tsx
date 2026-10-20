"use client";

/**
 * @intent Create and edit an invoice with a live preview and send-email actions.
 * @in invoiceId from the route
 * @out portal header, editor form, preview toolbar
 * @not invoice list page
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActionBar } from "../components/ActionBar";
import { EmailDialog } from "../components/EmailDialog";
import { InvoicePreview } from "../components/InvoicePreview";
import { useInvoiceEditor } from "../hooks/useInvoiceEditor";
import { bannerClass, bannerErrorClass, bannerSuccessClass, btnAccentClass, btnPrimaryClass } from "../../../styles/Ui";
import { cx } from "../../../utils/Cx";
import { PortalHeader } from "../portal/PortalHeader";
import { usePortalLeaveGuard } from "../portal/PortalLeaveGuard";
import { InvoiceFields } from "./InvoiceFields";
import styles from "./InvoiceEditorPage.module.scss";

type InvoiceEditorViewProps = {
  invoiceId: string | null;
};

export function InvoiceEditorView({ invoiceId }: InvoiceEditorViewProps) {
  const [mounted, setMounted] = useState(false);
  const editor = useInvoiceEditor(invoiceId);
  const blocked = editor.state.loadStatus === "missing" || editor.state.loadStatus === "error";
  const ready = !blocked && (editor.state.loadStatus === "ready" || !invoiceId);
  const title = invoiceId ? editor.state.invoice.number || "Invoice" : "New invoice";

  usePortalLeaveGuard(() => editor.confirmDiscard());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.body} />;
  }

  return (
    <>
      <a className={cx("no-print", styles.skipLink)} href="#editor">
        Skip to editor
      </a>
      <PortalHeader title={title} />

      {!blocked && (editor.state.formError || editor.sentCopy || editor.state.loadStatus === "loading" || editor.state.loadStatus === "idle") ? (
        <div className={cx("no-print", styles.status)}>
          {editor.state.formError && !editor.state.emailOpen ? (
            <p className={bannerErrorClass} role="status">
              {editor.state.formError}
            </p>
          ) : null}
          {editor.sentCopy ? (
            <p className={bannerSuccessClass} role="status">
              {editor.sentCopy}
            </p>
          ) : null}
          {editor.state.loadStatus === "loading" || (Boolean(invoiceId) && editor.state.loadStatus === "idle") ? (
            <p className={bannerClass} role="status">
              Loading invoice…
            </p>
          ) : null}
        </div>
      ) : null}

      {blocked ? (
        <div className={cx("no-print", styles.missing)}>
          <p className={styles.missingTitle}>{editor.state.loadStatus === "missing" ? "Invoice not found" : "Could not open this invoice"}</p>
          <p className={styles.missingCopy}>Return to the list or start a new draft.</p>
          <div className={styles.missingActions}>
            <Link className={cx(btnAccentClass, "inline-flex items-center")} href="/">
              Back to invoices
            </Link>
            <Link className={cx(btnPrimaryClass, "inline-flex items-center")} href="/invoices/new">
              Create invoice
            </Link>
          </div>
        </div>
      ) : null}

      {ready ? (
        <div className={styles.body}>
          <div className={styles.desk}>
            <InvoiceFields
              state={editor.state}
              totals={editor.totals}
              errors={editor.errors}
              dispatch={editor.dispatch}
              onKeyDown={editor.handleEditorKeyDown}
            />
            <aside className={styles.preview} aria-label="Live preview">
              <div className={cx("no-print", styles.previewBar)}>
                <p className={styles.previewLabel}>Live preview</p>
                <ActionBar
                  saving={editor.state.saveStatus === "saving"}
                  emailDisabled={editor.emailDisabled}
                  onPrint={() => window.print()}
                  onSave={() => void editor.handleSave()}
                  onEmail={editor.openEmail}
                />
              </div>
              <InvoicePreview invoice={editor.state.invoice} totals={editor.totals} />
            </aside>
          </div>
        </div>
      ) : null}

      <EmailDialog
        open={editor.state.emailOpen}
        to={editor.state.emailTo}
        sending={editor.state.emailStatus === "sending"}
        error={
          editor.state.emailStatus === "error" || editor.state.emailStatus === "unconfigured"
            ? (editor.state.formError ?? undefined)
            : undefined
        }
        onToChange={(to) => editor.dispatch({ type: "setEmailTo", to })}
        onClose={() => editor.dispatch({ type: "emailOpen", open: false })}
        onSend={() => void editor.handleEmail()}
      />
    </>
  );
}
