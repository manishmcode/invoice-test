"use client";

import { createContext, useContext } from "react";

export type PortalSidebarUi = {
  collapsed: boolean;
  isMobile: boolean;
  toggle: () => void;
  closeMobile: () => void;
};

export const PortalSidebarUiContext = createContext<PortalSidebarUi | null>(null);

export function usePortalSidebarUi(): PortalSidebarUi {
  const value = useContext(PortalSidebarUiContext);
  if (!value) {
    throw new Error("usePortalSidebarUi must be used inside PortalShell");
  }
  return value;
}
