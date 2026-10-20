import type { Invoice } from "@hearth/invoice-types/modules/Invoice";
import { formatUsd } from "@hearth/invoice-types/modules/Invoice";

/** Inline copies of Tokens.scss --hl-* values. Email clients ignore CSS variables. */
const EmailColor = {
  desk: "#F3F3F6",
  paper: "#FFFFFF",
  ink: "#1D1D1D",
  muted: "#666670",
  rule: "#E0E0E2",
  accent: "#7D3BDF",
} as const;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function multiline(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

/** Build HTML and text bodies from the persisted invoice. Visible custom fields only. */
export function renderInvoiceEmail(invoice: Invoice): {
  subject: string;
  html: string;
  text: string;
} {
  const visibleFields = invoice.customFields.filter((field) => field.visible);
  const subject = `Invoice ${invoice.number} from ${invoice.business.name}`;

  const lineRows = invoice.lineItems
    .map((line, index) => {
      const amount = formatUsd(invoice.totals.lineTotals[index] ?? 0);
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${EmailColor.rule};">${escapeHtml(line.description)}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${EmailColor.rule};text-align:right;font-variant-numeric:tabular-nums;">${line.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${EmailColor.rule};text-align:right;font-variant-numeric:tabular-nums;">${formatUsd(line.unitPrice)}</td>
        <td style="padding:8px 0;border-bottom:1px solid ${EmailColor.rule};text-align:right;font-variant-numeric:tabular-nums;">${amount}</td>
      </tr>`;
    })
    .join("");

  const customRows = visibleFields
    .map(
      (field) =>
        `<tr><td style="padding:4px 0;color:${EmailColor.muted};">${escapeHtml(field.label)}</td><td style="padding:4px 0;">${escapeHtml(field.value)}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;background:${EmailColor.desk};color:${EmailColor.ink};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:24px auto;background:${EmailColor.paper};padding:32px;border:1px solid ${EmailColor.rule};border-radius:8px;">
    <p style="margin:0;letter-spacing:0.16em;font-size:12px;text-transform:uppercase;color:${EmailColor.accent};">Invoice</p>
    <h1 style="font-size:28px;margin:8px 0 24px;">${escapeHtml(invoice.business.name)}</h1>
    <p style="margin:0 0 16px;">${multiline(invoice.business.address)}<br />${escapeHtml(invoice.business.email)} · ${escapeHtml(invoice.business.phone)}</p>
    <p style="margin:0 0 24px;"><strong>Invoice ${escapeHtml(invoice.number)}</strong><br />Issued ${escapeHtml(invoice.issueDate)} · Due ${escapeHtml(invoice.dueDate)}</p>
    <p style="margin:0 0 24px;"><strong>Bill to</strong><br />${escapeHtml(invoice.customer.name)}<br />${multiline(invoice.customer.address)}<br />${escapeHtml(invoice.customer.email)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid ${EmailColor.rule};padding-bottom:8px;color:${EmailColor.muted};font-weight:500;">Description</th>
          <th style="text-align:right;border-bottom:1px solid ${EmailColor.rule};padding-bottom:8px;color:${EmailColor.muted};font-weight:500;">Qty</th>
          <th style="text-align:right;border-bottom:1px solid ${EmailColor.rule};padding-bottom:8px;color:${EmailColor.muted};font-weight:500;">Rate</th>
          <th style="text-align:right;border-bottom:1px solid ${EmailColor.rule};padding-bottom:8px;color:${EmailColor.muted};font-weight:500;">Amount</th>
        </tr>
      </thead>
      <tbody>${lineRows}</tbody>
    </table>
    <p style="text-align:right;margin:16px 0 0;font-variant-numeric:tabular-nums;">Subtotal ${formatUsd(invoice.totals.subtotal)}<br />Discount ${formatUsd(invoice.totals.discountAmount)}<br />Tax ${formatUsd(invoice.totals.taxAmount)}</p>
    <p style="text-align:right;font-size:22px;color:${EmailColor.accent};margin:8px 0 24px;font-variant-numeric:tabular-nums;"><strong>Total ${formatUsd(invoice.totals.grandTotal)}</strong></p>
    ${invoice.notes ? `<p>${multiline(invoice.notes)}</p>` : ""}
    ${customRows ? `<table style="font-size:14px;margin-top:16px;">${customRows}</table>` : ""}
    <p style="margin-top:32px;font-size:13px;color:${EmailColor.muted};">Due on ${escapeHtml(invoice.dueDate)} · Thank you</p>
  </div>
</body>
</html>`;

  const text = `${invoice.business.name}
Invoice ${invoice.number}
Bill to: ${invoice.customer.name}
Total: ${formatUsd(invoice.totals.grandTotal)}
`;

  return { subject, html, text };
}
