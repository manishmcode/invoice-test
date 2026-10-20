"use client";

import { cx } from "../../../utils/Cx";
import { usePortalSidebarUi } from "./PortalSidebarUi";
import styles from "./PortalHeader.module.scss";

export function PortalHeader({ title }: { title: string }) {
  const { isMobile, collapsed, toggle } = usePortalSidebarUi();

  return (
    <header className={cx("no-print", styles.header)}>
      <div className={styles.lead}>
        {isMobile ? (
          <button
            type="button"
            className={styles.menu}
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="sidebar-navigation"
            aria-label={collapsed ? "Open menu" : "Close menu"}
          >
            <svg className={styles.menuIcon} viewBox="0 0 20 20" aria-hidden="true">
              {collapsed ? (
                <path
                  d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M5 5l10 10M15 5L5 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        ) : null}
        <h1 className={styles.title}>{title}</h1>
      </div>
    </header>
  );
}
