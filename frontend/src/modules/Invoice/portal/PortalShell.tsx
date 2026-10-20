"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { PortalLeaveGuard } from "./PortalLeaveGuard";
import { PortalSidebar } from "./PortalSidebar";
import { PortalSidebarUiContext } from "./PortalSidebarUi";
import styles from "./PortalShell.module.scss";

export function PortalShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 959px)");
    const apply = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((current) => !current);
  }, []);

  const closeMobile = useCallback(() => {
    setCollapsed((current) => (isMobile ? true : current));
  }, [isMobile]);

  const sidebarUi = useMemo(
    () => ({ collapsed, isMobile, toggle, closeMobile }),
    [collapsed, isMobile, toggle, closeMobile],
  );

  return (
    <PortalLeaveGuard>
      <PortalSidebarUiContext.Provider value={sidebarUi}>
        <div className={styles.shell}>
          <PortalSidebar />
          <div className={styles.workspace}>{children}</div>
        </div>
      </PortalSidebarUiContext.Provider>
    </PortalLeaveGuard>
  );
}
