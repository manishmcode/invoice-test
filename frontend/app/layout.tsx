import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nunito_Sans } from "next/font/google";
import { PortalShell } from "@/modules/Invoice/portal/PortalShell";
import "../src/styles/Tokens.scss";
import "../src/styles/Tailwind.css";
import "../src/styles/Globals.scss";
import "../src/styles/Print.scss";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hearth & Ledger",
  description: "Invoice portal for a ceramics studio.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full overflow-hidden`}>
      <body className="h-full overflow-hidden">
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
