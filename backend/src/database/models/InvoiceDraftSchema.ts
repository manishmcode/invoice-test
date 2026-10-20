import { randomUUID } from "node:crypto";
import type {
  Business,
  CreateInvoiceBody,
  Customer,
  EmailInvoiceBody,
  InvoiceTotals,
} from "@hearth/invoice-types/modules/Invoice";
import { z } from "zod";
import { zodToFields } from "../../utils/ZodFields";

const issueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be YYYY-MM-DD");

const dueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date cannot be before issue date");

const uuidSchema = z.uuid();

function asUuid(id: string | undefined): string {
  if (id && uuidSchema.safeParse(id).success) {
    return id;
  }
  return randomUUID();
}

function emailString(message: string) {
  return z.email({ error: message });
}

export const businessSchema = z
  .object({
    name: z.string().trim().min(1, "Business name is required").max(120, "Business name is required"),
    address: z
      .string()
      .trim()
      .min(1, "Business address is required")
      .max(500, "Business address is required"),
    email: emailString("Enter a valid business email"),
    phone: z.string().trim().min(1, "Business phone is required").max(40, "Business phone is required"),
  })
  .strip() satisfies z.ZodType<Business>;

export const customerSchema = z
  .object({
    name: z.string().trim().min(1, "Customer name is required").max(120, "Customer name is required"),
    address: z
      .string()
      .trim()
      .min(1, "Customer address is required")
      .max(500, "Customer address is required"),
    email: emailString("Enter a valid customer email"),
  })
  .strip() satisfies z.ZodType<Customer>;

export const lineItemDraftSchema = z
  .object({
    id: z.string().optional(),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(200, "Description is required"),
    quantity: z.number().finite().min(0, "Quantity cannot be negative"),
    unitPrice: z.number().finite().min(0, "Price cannot be negative"),
  })
  .strip();

export const customFieldDraftSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().trim().min(1, "Label is required").max(80, "Label is required"),
    value: z.string().max(500, "Value is too long"),
    visible: z.boolean(),
  })
  .strip();

export const invoiceDraftSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(1, "Invoice number is required")
      .max(40, "Invoice number is required"),
    issueDate: issueDateSchema,
    dueDate: dueDateSchema,
    notes: z.string().max(2000, "Notes are too long").default(""),
    business: businessSchema,
    customer: customerSchema,
    lineItems: z
      .array(lineItemDraftSchema)
      .min(1, "Add at least one line item")
      .max(50, "Add at least one line item"),
    discountAmount: z.number().finite().min(0, "Discount cannot be negative"),
    taxRatePercent: z
      .number()
      .finite()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100"),
    customFields: z.array(customFieldDraftSchema).max(20, "Too many custom fields").default([]),
  })
  .strip()
  .superRefine((data, ctx) => {
    if (data.dueDate < data.issueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Due date cannot be before issue date",
      });
    }
  });

export const emailRequestSchema = z
  .object({
    to: emailString("Enter a valid email"),
  })
  .strip() satisfies z.ZodType<EmailInvoiceBody>;

export const totalsSchema = z
  .object({
    lineTotals: z.array(z.number()),
    subtotal: z.number(),
    discountAmount: z.number(),
    taxAmount: z.number(),
    grandTotal: z.number(),
  })
  .strip() satisfies z.ZodType<InvoiceTotals>;

export { zodToFields };

export function normalizeDraft(input: z.infer<typeof invoiceDraftSchema>): CreateInvoiceBody {
  return {
    ...input,
    notes: input.notes ?? "",
    customFields: (input.customFields ?? []).map((field) => ({
      ...field,
      id: asUuid(field.id),
    })),
    lineItems: input.lineItems.map((line) => ({
      ...line,
      id: asUuid(line.id),
    })),
  };
}

export function parseDraft(body: unknown): CreateInvoiceBody {
  return normalizeDraft(invoiceDraftSchema.parse(body));
}

export function parseEmailRequest(body: unknown): EmailInvoiceBody {
  return emailRequestSchema.parse(body);
}
