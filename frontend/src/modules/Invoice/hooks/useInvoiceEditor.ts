/**
 * @intent Load, save, and email an invoice draft from the editor.
 * @in invoiceId from the route
 * @out editor state, totals, save and email handlers
 * @not file uploads, SMTP
 */
import type { Invoice } from "@hearth/invoice-types/modules/Invoice";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useReducer, type KeyboardEvent } from "react";
import { createNewInvoice } from "../data/SeedInvoice";
import { validateDraft } from "../models/Invoice";
import {
  ApiError,
  createInvoice,
  getInvoice,
  sendInvoiceEmail,
  updateInvoice,
} from "../services/InvoiceApi";
import { createInitialState, editorReducer } from "../state/EditorReducer";
import { isInvoiceId } from "../utils/InvoiceId";
import { liveMoneyErrors, previewTotals } from "../utils/PreviewTotals";
import { demoMailInbox, isDemoMailInbox } from "../data/DemoMail";
import { redactEmail } from "../utils/RedactEmail";

export function useInvoiceEditor(invoiceId: string | null) {
  const router = useRouter();
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialState);
  const totals = useMemo(() => previewTotals(state.invoice), [state.invoice]);
  const errors = { ...liveMoneyErrors(state.invoice), ...state.fieldErrors };
  const emailDisabled = state.dirty || !state.invoiceId;
  const sentCopy = state.emailStatus === "sent" ? `Sent to ${redactEmail(state.emailTo)}` : null;

  function applyServerInvoice(invoice: Invoice): void {
    dispatch({ type: "hydrateFromServer", invoice });
  }

  useEffect(() => {
    if (!invoiceId) {
      dispatch({ type: "hydrateFromSeed", invoice: createNewInvoice() });
      return;
    }

    const requestedId = invoiceId;
    if (!isInvoiceId(requestedId)) {
      dispatch({ type: "loadMissing" });
      return;
    }

    const controller = new AbortController();

    async function load(): Promise<void> {
      dispatch({ type: "loadStart" });
      try {
        const invoice = await getInvoice(requestedId, controller.signal);
        applyServerInvoice(invoice);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          dispatch({ type: "loadMissing" });
          return;
        }
        dispatch({
          type: "loadFailed",
          message: error instanceof Error ? error.message : "Could not load the invoice.",
        });
      }
    }

    void load();
    return () => controller.abort();
  }, [invoiceId]);

  function confirmDiscard(): boolean {
    if (!state.dirty) {
      return true;
    }
    return window.confirm("Discard unsaved changes?");
  }

  async function handleSave() {
    const fieldErrors = validateDraft(state.invoice);
    if (Object.keys(fieldErrors).length > 0) {
      dispatch({ type: "setFieldErrors", fields: fieldErrors });
      return;
    }

    dispatch({ type: "saveStart" });
    try {
      const saved = state.invoiceId
        ? await updateInvoice(state.invoiceId, state.invoice)
        : await createInvoice(state.invoice);
      dispatch({ type: "saveOk", invoice: saved });
      if (!invoiceId) {
        router.replace(`/invoices/${saved.id}`);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        dispatch({
          type: "saveFail",
          message: error.message,
          fields: error.fields,
        });
        return;
      }
      dispatch({ type: "saveFail", message: "Save failed. Your edits are still here." });
    }
  }

  async function handleEmail() {
    if (!state.invoiceId || state.dirty) {
      return;
    }
    if (!isDemoMailInbox(state.emailTo)) {
      dispatch({
        type: "emailFail",
        message: `This demo only sends to ${demoMailInbox}. Open that inbox on Yopmail.`,
      });
      return;
    }
    dispatch({ type: "emailStart" });
    try {
      await sendInvoiceEmail(state.invoiceId, state.emailTo);
      dispatch({ type: "emailOk" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email failed";
      if (error instanceof ApiError && error.code === "EMAIL_UNCONFIGURED") {
        dispatch({ type: "emailUnconfigured", message });
        return;
      }
      dispatch({ type: "emailFail", message });
    }
  }

  function openEmail() {
    dispatch({ type: "setEmailTo", to: demoMailInbox });
    dispatch({ type: "emailOpen", open: true });
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      event.preventDefault();
    }
  }

  return {
    state,
    dispatch,
    totals,
    errors,
    emailDisabled,
    sentCopy,
    confirmDiscard,
    handleSave,
    handleEmail,
    openEmail,
    handleEditorKeyDown,
  };
}
