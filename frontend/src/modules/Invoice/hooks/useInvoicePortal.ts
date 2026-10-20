import type { InvoiceSummary } from "@hearth/invoice-types/modules/Invoice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, listInvoices } from "../services/InvoiceApi";
import { isInvoiceId } from "../utils/InvoiceId";

export function useInvoicePortal() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const legacyId = new URLSearchParams(window.location.search).get("id");
    if (legacyId && isInvoiceId(legacyId)) {
      router.replace(`/invoices/${legacyId}`);
    }
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();

    async function load(): Promise<void> {
      try {
        const listed = await listInvoices(controller.signal);
        setInvoices(listed.invoices);
        setError(null);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setError(caught instanceof ApiError || caught instanceof Error ? caught.message : "Could not load invoices.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return { invoices, loading, error };
}
