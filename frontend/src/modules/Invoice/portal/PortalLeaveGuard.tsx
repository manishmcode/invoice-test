"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";

type LeaveGuardContextValue = {
  setGuard: (guard: (() => boolean) | null) => void;
  tryLeave: () => boolean;
};

const LeaveGuardContext = createContext<LeaveGuardContextValue | null>(null);

export function PortalLeaveGuard({ children }: { children: ReactNode }) {
  const guardRef = useRef<(() => boolean) | null>(null);

  const setGuard = useCallback((guard: (() => boolean) | null) => {
    guardRef.current = guard;
  }, []);

  const tryLeave = useCallback(() => {
    return guardRef.current ? guardRef.current() : true;
  }, []);

  return <LeaveGuardContext.Provider value={{ setGuard, tryLeave }}>{children}</LeaveGuardContext.Provider>;
}

export function usePortalLeaveGuard(guard: () => boolean) {
  const context = useContext(LeaveGuardContext);
  const guardRef = useRef(guard);
  guardRef.current = guard;

  useEffect(() => {
    if (!context) {
      return;
    }
    const bound = () => guardRef.current();
    context.setGuard(bound);
    return () => context.setGuard(null);
  }, [context]);
}

export function useTryLeave(): () => boolean {
  const context = useContext(LeaveGuardContext);
  return context?.tryLeave ?? (() => true);
}
