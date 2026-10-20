import type { ZodError } from "zod";

export function zodToFields(error: ZodError): Record<string, string> {
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
