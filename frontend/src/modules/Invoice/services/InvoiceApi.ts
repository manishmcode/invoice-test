/**
 * @intent Call the invoice HTTP API and map failures to ApiError.
 * @in invoice drafts, ids, email recipient
 * @out invoices and typed errors
 * @not file uploads
 */
import type {
  ApiError as ApiErrorBody,
  CreateInvoiceBody,
  Invoice,
  InvoiceListResponse,
  InvoiceResponse,
} from "@hearth/invoice-types/modules/Invoice";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type EmailOk = { accepted?: boolean };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function throwIfFailed(response: Response, body: ApiErrorBody | null): void {
  if (response.ok) {
    return;
  }
  throw new ApiError(
    response.status,
    body?.error?.code ?? "INTERNAL_ERROR",
    body?.error?.message ?? "Request failed",
    body?.error?.fields,
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(0, "INTERNAL_ERROR", "Cannot reach the API. Is the backend running?");
  }

  const body = (await readJson(response)) as (T & EmailOk & ApiErrorBody) | null;
  throwIfFailed(response, body);
  return body as T;
}

export async function listInvoices(signal?: AbortSignal): Promise<InvoiceListResponse> {
  return request<InvoiceListResponse>("/api/invoices", { signal });
}

export async function createInvoice(draft: CreateInvoiceBody): Promise<Invoice> {
  const body = await request<InvoiceResponse>("/api/invoices", {
    method: "POST",
    body: JSON.stringify(draft),
  });
  return body.invoice;
}

export async function getInvoice(id: string, signal?: AbortSignal): Promise<Invoice> {
  const body = await request<InvoiceResponse>(`/api/invoices/${id}`, { signal });
  return body.invoice;
}

export async function getLastInvoice(signal?: AbortSignal): Promise<Invoice> {
  const body = await request<InvoiceResponse>("/api/invoices/last", { signal });
  return body.invoice;
}

export async function updateInvoice(id: string, draft: CreateInvoiceBody): Promise<Invoice> {
  const body = await request<InvoiceResponse>(`/api/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(draft),
  });
  return body.invoice;
}

export async function sendInvoiceEmail(id: string, to: string): Promise<void> {
  await request<{ accepted: true }>(`/api/invoices/${id}/email`, {
    method: "POST",
    body: JSON.stringify({ to }),
  });
}
