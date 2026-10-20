"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { cx } from "../../../utils/Cx";
import { PortalIcon, type PortalIconName } from "./PortalIcons";
import styles from "./PortalAction.module.scss";

export type PortalActionProps = {
  label: string;
  icon: PortalIconName;
  href?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  variant?: "ghost" | "primary" | "plain";
  disabled?: boolean;
  listed?: boolean;
};

export function PortalAction({
  label,
  icon,
  href,
  onClick,
  variant = "ghost",
  disabled = false,
  listed = true,
}: PortalActionProps) {
  const className = cx(styles.action, styles[variant]);
  const content = (
    <>
      <PortalIcon name={icon} />
      {variant === "plain" ? null : <span className={styles.label}>{label}</span>}
    </>
  );

  const control = href ? (
    <Link
      className={className}
      href={href}
      aria-label={label}
      title={label}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {content}
    </Link>
  ) : (
    <button type="button" className={className} aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );

  return listed ? <li className={styles.item}>{control}</li> : control;
}

export function PortalActionList({
  children,
  className,
  labeled = false,
}: {
  children: ReactNode;
  className?: string;
  labeled?: boolean;
}) {
  return <ul className={cx(styles.list, labeled && styles.labeled, className)}>{children}</ul>;
}
