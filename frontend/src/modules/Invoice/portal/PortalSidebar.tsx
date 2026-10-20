"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { cx } from "../../../utils/Cx";
import { useTryLeave } from "./PortalLeaveGuard";
import { usePortalSidebarUi } from "./PortalSidebarUi";
import styles from "./PortalSidebar.module.scss";

const links = [
  {
    href: "/",
    label: "Invoices",
    match: (path: string) => path === "/" || path === "/invoices" || /^\/invoices\/(?!new$).+/.test(path),
    icon: "invoices" as const,
  },
  {
    href: "/invoices/new",
    label: "Create invoice",
    match: (path: string) => path === "/invoices/new",
    icon: "create" as const,
  },
];

function NavIcon({ name }: { name: "invoices" | "create" }) {
  if (name === "create") {
    return (
      <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M10 4v12M4 10h12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4 5.5h12M4 10h12M4 14.5h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PortalSidebar() {
  const pathname = usePathname();
  const tryLeave = useTryLeave();
  const { collapsed, isMobile, closeMobile, toggle } = usePortalSidebarUi();
  const railCollapsed = collapsed && !isMobile;
  const hiddenOnMobile = isMobile && collapsed;

  function handleNav(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (pathname === href) {
      closeMobile();
      return;
    }
    if (!tryLeave()) {
      event.preventDefault();
      return;
    }
    closeMobile();
  }

  return (
    <>
      {isMobile && !collapsed ? (
        <button type="button" className={cx("no-print", styles.backdrop)} aria-label="Close menu" onClick={closeMobile} />
      ) : null}
      <aside
        className={cx(
          "no-print",
          styles.sidebar,
          railCollapsed && styles.rail,
          hiddenOnMobile && styles.hidden,
          isMobile && !collapsed && styles.drawer,
        )}
        data-collapsed={railCollapsed ? "true" : "false"}
        aria-label="Portal"
      >
        <div className={styles.inner}>
          <div className={styles.brandRow}>
            <Link className={styles.brand} href="/" onClick={(event) => handleNav(event, "/")} title="Hearth & Ledger">
              {railCollapsed ? "H" : "Hearth & Ledger"}
            </Link>
          </div>
          <nav className={styles.nav} id="sidebar-navigation">
            {links.map((link) => {
              const active = link.match(pathname);
              return (
                <Link
                  key={link.href}
                  className={cx(styles.link, active && styles.active, railCollapsed && styles.linkRail)}
                  href={link.href}
                  title={link.label}
                  onClick={(event) => handleNav(event, link.href)}
                >
                  <NavIcon name={link.icon} />
                  {!railCollapsed ? <span className={styles.label}>{link.label}</span> : null}
                </Link>
              );
            })}
          </nav>
          {!isMobile ? (
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.collapse}
                onClick={toggle}
                aria-expanded={!collapsed}
                aria-controls="sidebar-navigation"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d={collapsed ? "M8 5l5 5-5 5" : "M12 5l-5 5 5 5"}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {!railCollapsed ? <span>Collapse</span> : null}
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
