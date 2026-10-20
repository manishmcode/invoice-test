"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { cx } from "../../../utils/Cx";
import styles from "./InvoiceAppHeader.module.scss";

type InvoiceAppHeaderProps = {
  size: "portal" | "editor";
  backHref?: string;
  onBack?: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
};

export function InvoiceAppHeader({ size, backHref, onBack, children }: InvoiceAppHeaderProps) {
  return (
    <header className={cx("no-print", styles.masthead, size === "portal" && styles.portal)}>
      <div className={styles.brand}>
        {backHref ? (
          <a className={styles.back} href={backHref} onClick={onBack}>
            Back to invoices
          </a>
        ) : null}
        <span className={styles.mark} aria-hidden="true" />
        <Link className={styles.wordmark} href="/">
          Hearth & Ledger
        </Link>
        <p className={styles.tagline}>Ceramics studio invoices</p>
      </div>
      <div className={styles.actions}>{children}</div>
    </header>
  );
}
