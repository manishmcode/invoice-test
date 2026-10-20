import type { InvoiceDraft, InvoiceTotals } from "@hearth/invoice-types/modules/Invoice";
import { formatUsd } from "@hearth/invoice-types/modules/Invoice";
import styles from "./InvoicePreview.module.scss";

type InvoicePreviewProps = {
  invoice: InvoiceDraft;
  totals: InvoiceTotals;
};

function formatSheetDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function InvoicePreview({ invoice, totals }: InvoicePreviewProps) {
  const visibleFields = invoice.customFields.filter((field) => field.visible);

  return (
    <article id="invoice-sheet" className={styles.sheet} aria-label="Invoice preview">
      <div className={styles.accent} aria-hidden="true" />
      <div className={styles.body}>
        <header className={styles.header}>
          <div className="min-w-0">
            <p className={styles.eyebrow}>Invoice</p>
            <h2 className={styles.wordmark}>{invoice.business.name || "Hearth & Ledger"}</h2>
          </div>
          <dl className={styles.meta}>
            <div>
              <dt>No.</dt>
              <dd>{invoice.number}</dd>
            </div>
            <div>
              <dt>Issued</dt>
              <dd>{formatSheetDate(invoice.issueDate)}</dd>
            </div>
            <div>
              <dt>Due</dt>
              <dd>{formatSheetDate(invoice.dueDate)}</dd>
            </div>
          </dl>
        </header>

        <div className={styles.parties}>
          <div>
            <p className={styles.partyLabel}>From</p>
            <p className={styles.partyName}>{invoice.business.name}</p>
            <p className={styles.partyBlock}>{invoice.business.address}</p>
            <p>{invoice.business.email}</p>
            <p>{invoice.business.phone}</p>
          </div>
          <div>
            <p className={styles.partyLabel}>Bill to</p>
            <p className={styles.partyName}>{invoice.customer.name}</p>
            <p className={styles.partyBlock}>{invoice.customer.address}</p>
            <p>{invoice.customer.email}</p>
          </div>
        </div>

        <table className={styles.table}>
          <colgroup>
            <col />
            <col className={styles.colQty} />
            <col className={styles.colMoney} />
            <col className={styles.colMoney} />
          </colgroup>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((line, index) => (
              <tr key={line.id}>
                <td>{line.description || "—"}</td>
                <td className={styles.money}>{line.quantity}</td>
                <td className={styles.money}>{formatUsd(line.unitPrice)}</td>
                <td className={styles.money}>{formatUsd(totals.lineTotals[index] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals} aria-live="polite">
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span className={styles.money}>{formatUsd(totals.subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Discount</span>
            <span className={styles.money}>{formatUsd(totals.discountAmount)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax</span>
            <span className={styles.money}>{formatUsd(totals.taxAmount)}</span>
          </div>
          <div className={styles.grand}>
            <span>Total</span>
            <span className={styles.money}>{formatUsd(totals.grandTotal)}</span>
          </div>
        </div>

        {invoice.notes ? (
          <div className={styles.notes}>
            <p className={styles.partyLabel}>Notes</p>
            <p className={styles.partyBlock}>{invoice.notes}</p>
          </div>
        ) : null}

        {visibleFields.length > 0 ? (
          <dl className={styles.fields}>
            {visibleFields.map((field) => (
              <div key={field.id}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <p className={styles.footer}>Due {formatSheetDate(invoice.dueDate)}</p>
      </div>
    </article>
  );
}
