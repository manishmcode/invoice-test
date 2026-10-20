import {
  CalculationError,
  calculateInvoice,
  type CreateInvoiceBody,
  type Invoice,
} from "@hearth/invoice-types/modules/Invoice";
import { z } from "zod";

const issueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be YYYY-MM-DD");

const dueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date cannot be before issue date");

function emailString(message: string) {
  return z.email({ error: message });
}

export const invoiceDraftSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(1, "Invoice number is required")
      .max(40, "Invoice number is required"),
    issueDate: issueDateSchema,
    dueDate: dueDateSchema,
    notes: z.string().max(2000, "Notes are too long"),
    business: z
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
      .strip(),
    customer: z
      .object({
        name: z.string().trim().min(1, "Customer name is required").max(120, "Customer name is required"),
        address: z
          .string()
          .trim()
          .min(1, "Customer address is required")
          .max(500, "Customer address is required"),
        email: emailString("Enter a valid customer email"),
      })
      .strip(),
    lineItems: z
      .array(
        z
          .object({
            id: z.string(),
            description: z
              .string()
              .trim()
              .min(1, "Description is required")
              .max(200, "Description is required"),
            quantity: z.number().finite().min(0, "Quantity cannot be negative"),
            unitPrice: z.number().finite().min(0, "Price cannot be negative"),
          })
          .strip(),
      )
      .min(1, "Add at least one line item")
      .max(50, "Add at least one line item"),
    discountAmount: z.number().finite().min(0, "Discount cannot be negative"),
    taxRatePercent: z
      .number()
      .finite()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100"),
    customFields: z
      .array(
        z
          .object({
            id: z.string(),
            label: z.string().trim().min(1, "Label is required").max(80, "Label is required"),
            value: z.string().max(500, "Value is too long"),
            visible: z.boolean(),
          })
          .strip(),
      )
      .max(20, "Too many custom fields"),
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
  }) satisfies z.ZodType<CreateInvoiceBody>;

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    const key = path.length > 0 ? path : "form";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export function validateDraft(draft: CreateInvoiceBody): Record<string, string> {
  const parsed = invoiceDraftSchema.safeParse(draft);
  if (!parsed.success) {
    return zodToFields(parsed.error);
  }
  try {
    calculateInvoice(parsed.data);
    return {};
  } catch (error) {
    if (error instanceof CalculationError) {
      return error.fields;
    }
    throw error;
  }
}

export function toDraft(invoice: Invoice): CreateInvoiceBody {
  return {
    number: invoice.number,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    notes: invoice.notes,
    business: invoice.business,
    customer: invoice.customer,
    lineItems: invoice.lineItems,
    discountAmount: invoice.discountAmount,
    taxRatePercent: invoice.taxRatePercent,
    customFields: invoice.customFields,
  };
}
