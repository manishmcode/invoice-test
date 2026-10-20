import type { ReactNode } from "react";

export type PortalIconName = "preview" | "print" | "create" | "back" | "save" | "email" | "open";

const icons: Record<PortalIconName, ReactNode> = {
  preview: (
    <path
      d="M2.5 10s2.7-5 7.5-5 7.5 5 7.5 5-2.7 5-7.5 5-7.5-5-7.5-5zM10 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  print: (
    <path
      d="M5.5 7V3.5h9V7M5.5 13.5H4A1.5 1.5 0 0 1 2.5 12V9A1.5 1.5 0 0 1 4 7.5h12A1.5 1.5 0 0 1 17.5 9v3a1.5 1.5 0 0 1-1.5 1.5h-1.5M5.5 11.5h9v5h-9z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  create: (
    <path d="M10 4.5v11M4.5 10h11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  ),
  back: (
    <path
      d="M11.5 5 6.5 10l5 5M6.5 10H16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  save: (
    <path
      d="M4.5 4.5h9.2L15.5 6.3V15.5h-11zM6.5 4.5v3.8h7M6.5 15.5v-4.2h7v4.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  email: (
    <path
      d="M3.5 6.5h13v8h-13zM3.5 6.5 10 11l6.5-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  open: (
    <path
      d="M8 5.5H5.5v9h9V12M10.5 4.5H15.5V9.5M15.5 4.5 9 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export function PortalIcon({ name }: { name: PortalIconName }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}
