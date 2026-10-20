"use client";

import type { InvoiceSummary } from "@hearth/invoice-types/modules/Invoice";
import { formatUsd } from "@hearth/invoice-types/modules/Invoice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { cx } from "../../../utils/Cx";
import { formatIssueDate } from "../utils/FormatIssueDate";
import { PortalAction } from "./PortalAction";
import styles from "./InvoiceList.module.scss";

type InvoiceListProps = {
  invoices: InvoiceSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
  onPrint: (id: string) => void;
};

export function InvoiceList({ invoices, selectedId, onSelect, onPreview, onPrint }: InvoiceListProps) {
  const router = useRouter();

  function handleRowKey(event: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(id);
    }
  }

  return (
    <section className={styles.ledger}>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <caption className={styles.caption}>Saved invoices</caption>
          <thead>
            <tr>
              <th scope="col">Number</th>
              <th scope="col">Customer</th>
              <th scope="col">Date</th>
              <th scope="col" className={styles.moneyHead}>
                Total
              </th>
              <th scope="col" className={styles.actionsHead}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className={cx(selectedId === invoice.id && styles.selected)}
                tabIndex={0}
                aria-selected={selectedId === invoice.id}
                onClick={() => onSelect(invoice.id)}
                onDoubleClick={() => router.push(`/invoices/${invoice.id}`)}
                onKeyDown={(event) => handleRowKey(event, invoice.id)}
              >
                <th scope="row" className={styles.number}>
                  <Link
                    className={styles.numberLink}
                    href={`/invoices/${invoice.id}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {invoice.number}
                  </Link>
                </th>
                <td className={styles.customer}>{invoice.customerName || "No customer"}</td>
                <td className={styles.date}>{formatIssueDate(invoice.issueDate)}</td>
                <td className={styles.money}>{formatUsd(invoice.grandTotal)}</td>
                <td className={styles.actions} onClick={(event) => event.stopPropagation()}>
                  <ul className={styles.iconList}>
                    <PortalAction
                      icon="preview"
                      label={`Preview ${invoice.number}`}
                      variant="plain"
                      onClick={() => onPreview(invoice.id)}
                    />
                    <PortalAction
                      icon="print"
                      label={`Print ${invoice.number}`}
                      variant="plain"
                      onClick={() => onPrint(invoice.id)}
                    />
                    <PortalAction icon="open" label={`Open ${invoice.number}`} variant="plain" href={`/invoices/${invoice.id}`} />
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
