import type { CreateInvoiceBody, CustomField, Invoice, LineItem } from "@hearth/invoice-types/modules/Invoice";
import { createSeedInvoice } from "../data/SeedInvoice";
import { toDraft } from "../models/Invoice";

export type LoadStatus = "idle" | "loading" | "ready" | "missing" | "error";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type EmailStatus = "idle" | "sending" | "sent" | "unconfigured" | "error";

export type EditorState = {
  invoice: CreateInvoiceBody;
  invoiceId: string | null;
  dirty: boolean;
  loadStatus: LoadStatus;
  saveStatus: SaveStatus;
  emailStatus: EmailStatus;
  fieldErrors: Record<string, string>;
  formError: string | null;
  lastSavedAt: string | null;
  emailTo: string;
  emailOpen: boolean;
};

export type EditorAction =
  | { type: "hydrateFromSeed"; invoice: CreateInvoiceBody }
  | { type: "hydrateFromServer"; invoice: Invoice }
  | { type: "loadStart" }
  | { type: "loadMissing" }
  | { type: "loadFailed"; message: string }
  | { type: "patchBusiness"; patch: Partial<CreateInvoiceBody["business"]> }
  | { type: "patchCustomer"; patch: Partial<CreateInvoiceBody["customer"]> }
  | { type: "patchMeta"; patch: Partial<Pick<CreateInvoiceBody, "number" | "issueDate" | "dueDate" | "notes" | "discountAmount" | "taxRatePercent">> }
  | { type: "addLine" }
  | { type: "patchLine"; id: string; patch: Partial<LineItem> }
  | { type: "removeLine"; id: string }
  | { type: "addCustomField" }
  | { type: "patchCustomField"; id: string; patch: Partial<CustomField> }
  | { type: "removeCustomField"; id: string }
  | { type: "setFieldErrors"; fields: Record<string, string> }
  | { type: "saveStart" }
  | { type: "saveOk"; invoice: Invoice }
  | { type: "saveFail"; message: string; fields?: Record<string, string> }
  | { type: "emailOpen"; open: boolean }
  | { type: "setEmailTo"; to: string }
  | { type: "emailStart" }
  | { type: "emailOk" }
  | { type: "emailFail"; message: string }
  | { type: "emailUnconfigured"; message: string };

function clearKeys(errors: Record<string, string>, prefix: string): Record<string, string> {
  const next = { ...errors };
  for (const key of Object.keys(next)) {
    if (key === prefix || key.startsWith(`${prefix}.`)) {
      delete next[key];
    }
  }
  return next;
}

export function createInitialState(): EditorState {
  const invoice = createSeedInvoice();
  return {
    invoice,
    invoiceId: null,
    dirty: false,
    loadStatus: "idle",
    saveStatus: "idle",
    emailStatus: "idle",
    fieldErrors: {},
    formError: null,
    lastSavedAt: null,
    emailTo: invoice.customer.email,
    emailOpen: false,
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "hydrateFromSeed":
      return {
        ...state,
        invoice: action.invoice,
        invoiceId: null,
        dirty: false,
        loadStatus: "ready",
        fieldErrors: {},
        formError: null,
        emailTo: action.invoice.customer.email,
      };
    case "hydrateFromServer":
      return {
        ...state,
        invoice: toDraft(action.invoice),
        invoiceId: action.invoice.id,
        dirty: false,
        loadStatus: "ready",
        saveStatus: "saved",
        fieldErrors: {},
        formError: null,
        lastSavedAt: action.invoice.updatedAt,
        emailTo: action.invoice.customer.email,
      };
    case "loadStart":
      return { ...state, loadStatus: "loading", formError: null };
    case "loadMissing":
      return {
        ...state,
        loadStatus: "missing",
        formError: "Invoice not found.",
      };
    case "loadFailed":
      return {
        ...state,
        loadStatus: "error",
        formError: action.message,
      };
    case "patchBusiness":
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        invoice: { ...state.invoice, business: { ...state.invoice.business, ...action.patch } },
        fieldErrors: clearKeys(state.fieldErrors, "business"),
      };
    case "patchCustomer": {
      const previousEmail = state.invoice.customer.email;
      const customer = { ...state.invoice.customer, ...action.patch };
      const emailTo =
        action.patch.email !== undefined && state.emailTo === previousEmail
          ? action.patch.email
          : state.emailTo;
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        emailTo,
        invoice: { ...state.invoice, customer },
        fieldErrors: clearKeys(state.fieldErrors, "customer"),
      };
    }
    case "patchMeta": {
      const keys = Object.keys(action.patch);
      let fieldErrors = { ...state.fieldErrors };
      for (const key of keys) {
        fieldErrors = clearKeys(fieldErrors, key);
      }
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        invoice: { ...state.invoice, ...action.patch },
        fieldErrors,
      };
    }
    case "addLine":
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        invoice: {
          ...state.invoice,
          lineItems: [
            ...state.invoice.lineItems,
            {
              id: crypto.randomUUID(),
              description: "",
              quantity: 1,
              unitPrice: 0,
            },
          ],
        },
      };
    case "patchLine":
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        invoice: {
          ...state.invoice,
          lineItems: state.invoice.lineItems.map((line) =>
            line.id === action.id ? { ...line, ...action.patch } : line,
          ),
        },
        fieldErrors: clearKeys(state.fieldErrors, "lineItems"),
      };
    case "removeLine":
      if (state.invoice.lineItems.length <= 1) {
        return state;
      }
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        invoice: {
          ...state.invoice,
          lineItems: state.invoice.lineItems.filter((line) => line.id !== action.id),
        },
        fieldErrors: clearKeys(state.fieldErrors, "lineItems"),
      };
    case "addCustomField":
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        invoice: {
          ...state.invoice,
          customFields: [
            ...state.invoice.customFields,
            {
              id: crypto.randomUUID(),
              label: "",
              value: "",
              visible: true,
            },
          ],
        },
      };
    case "patchCustomField":
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        invoice: {
          ...state.invoice,
          customFields: state.invoice.customFields.map((field) =>
            field.id === action.id ? { ...field, ...action.patch } : field,
          ),
        },
        fieldErrors: clearKeys(state.fieldErrors, "customFields"),
      };
    case "removeCustomField":
      return {
        ...state,
        dirty: true,
        saveStatus: "idle",
        invoice: {
          ...state.invoice,
          customFields: state.invoice.customFields.filter((field) => field.id !== action.id),
        },
        fieldErrors: clearKeys(state.fieldErrors, "customFields"),
      };
    case "setFieldErrors":
      return { ...state, fieldErrors: action.fields };
    case "saveStart":
      return { ...state, saveStatus: "saving", formError: null };
    case "saveOk":
      return {
        ...state,
        invoice: toDraft(action.invoice),
        invoiceId: action.invoice.id,
        dirty: false,
        saveStatus: "saved",
        fieldErrors: {},
        formError: null,
        lastSavedAt: action.invoice.updatedAt,
      };
    case "saveFail":
      return {
        ...state,
        saveStatus: "error",
        formError: action.message,
        fieldErrors: action.fields ?? state.fieldErrors,
      };
    case "emailOpen":
      return {
        ...state,
        emailOpen: action.open,
        formError: action.open ? null : state.formError,
        emailStatus: action.open && state.emailStatus !== "sending" ? "idle" : state.emailStatus,
      };
    case "setEmailTo":
      return { ...state, emailTo: action.to, formError: null };
    case "emailStart":
      return { ...state, emailStatus: "sending", formError: null };
    case "emailOk":
      return { ...state, emailStatus: "sent", emailOpen: false };
    case "emailFail":
      return { ...state, emailStatus: "error", formError: action.message };
    case "emailUnconfigured":
      return {
        ...state,
        emailStatus: "unconfigured",
        formError: action.message,
      };
    default:
      return state;
  }
}
