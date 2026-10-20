/**
 * @intent Build an A4 invoice PDF buffer for the email attachment.
 * @in persisted Invoice with totals and visible custom fields
 * @out PDF bytes named by the caller
 * @not SMTP transport, HTML email body, uploaded user files
 */
import type { Invoice } from "@hearth/invoice-types/modules/Invoice";
import { formatUsd } from "@hearth/invoice-types/modules/Invoice";
import PDFDocument from "pdfkit";

const Page = {
  margin: 48,
  width: 595,
  bottom: 780,
} as const;

const Ink = {
  accent: "#C41E3A",
  ink: "#1A1414",
  muted: "#6B6161",
  rule: "#E8E1DD",
} as const;

const Col = {
  desc: Page.margin,
  qty: 340,
  rate: 400,
  amount: 470,
  right: Page.width - Page.margin,
} as const;

export function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: Page.margin });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawHeader(doc, invoice);
    let y = drawParties(doc, invoice, 168);
    y = drawLines(doc, invoice, y + 18);
    y = drawTotals(doc, invoice, y + 12);
    drawNotesAndFields(doc, invoice, y + 20);
    doc.end();
  });
}

function drawHeader(doc: PDFKit.PDFDocument, invoice: Invoice): void {
  doc.save();
  doc.rect(0, 0, Page.width, 8).fill(Ink.accent);
  doc.restore();

  doc.fillColor(Ink.accent).fontSize(10).text("INVOICE", Page.margin, 28);
  doc.fillColor(Ink.ink).fontSize(20).text(invoice.business.name || "Invoice", Page.margin, 46, {
    width: 300,
  });

  const metaX = 360;
  doc.fillColor(Ink.muted).fontSize(9);
  doc.text("No.", metaX, 46, { width: 50 });
  doc.text("Issued", metaX, 62, { width: 50 });
  doc.text("Due", metaX, 78, { width: 50 });
  doc.fillColor(Ink.ink).fontSize(9);
  doc.text(invoice.number, metaX + 50, 46, { width: 137, align: "right" });
  doc.text(invoice.issueDate, metaX + 50, 62, { width: 137, align: "right" });
  doc.text(invoice.dueDate, metaX + 50, 78, { width: 137, align: "right" });
}

function drawParties(doc: PDFKit.PDFDocument, invoice: Invoice, y: number): number {
  const colWidth = 240;
  doc.fillColor(Ink.muted).fontSize(9).text("From", Page.margin, y);
  doc.fillColor(Ink.ink).fontSize(11).text(invoice.business.name, Page.margin, y + 14, { width: colWidth });
  doc.fontSize(9).fillColor(Ink.ink);
  doc.text(invoice.business.address, Page.margin, doc.y, { width: colWidth });
  doc.text(invoice.business.email, Page.margin, doc.y, { width: colWidth });
  doc.text(invoice.business.phone, Page.margin, doc.y, { width: colWidth });
  const leftBottom = doc.y;

  doc.fillColor(Ink.muted).fontSize(9).text("Bill to", 320, y);
  doc.fillColor(Ink.ink).fontSize(11).text(invoice.customer.name, 320, y + 14, { width: colWidth });
  doc.fontSize(9);
  doc.text(invoice.customer.address, 320, doc.y, { width: colWidth });
  doc.text(invoice.customer.email, 320, doc.y, { width: colWidth });
  return Math.max(leftBottom, doc.y);
}

function drawLines(doc: PDFKit.PDFDocument, invoice: Invoice, y: number): number {
  doc.moveTo(Page.margin, y).lineTo(Col.right, y).strokeColor(Ink.ink).lineWidth(0.8).stroke();
  y += 8;
  doc.fillColor(Ink.muted).fontSize(8);
  doc.text("Description", Col.desc, y, { width: 280 });
  doc.text("Qty", Col.qty, y, { width: 50, align: "right" });
  doc.text("Rate", Col.rate, y, { width: 60, align: "right" });
  doc.text("Amount", Col.amount, y, { width: Col.right - Col.amount, align: "right" });
  y += 14;
  doc.moveTo(Page.margin, y).lineTo(Col.right, y).strokeColor(Ink.ink).lineWidth(0.8).stroke();
  y += 8;

  doc.fillColor(Ink.ink).fontSize(9);
  for (const [index, line] of invoice.lineItems.entries()) {
    if (y > Page.bottom - 80) {
      doc.addPage();
      y = Page.margin;
    }
    const amount = formatUsd(invoice.totals.lineTotals[index] ?? 0);
    const descHeight = doc.heightOfString(line.description || "—", { width: 280 });
    doc.text(line.description || "—", Col.desc, y, { width: 280 });
    doc.text(String(line.quantity), Col.qty, y, { width: 50, align: "right" });
    doc.text(formatUsd(line.unitPrice), Col.rate, y, { width: 60, align: "right" });
    doc.text(amount, Col.amount, y, { width: Col.right - Col.amount, align: "right" });
    y += Math.max(16, descHeight + 6);
    doc.moveTo(Page.margin, y).lineTo(Col.right, y).strokeColor(Ink.rule).lineWidth(0.5).stroke();
    y += 6;
  }
  return y;
}

function drawTotals(doc: PDFKit.PDFDocument, invoice: Invoice, y: number): number {
  const x = 340;
  const width = Col.right - x;
  doc.fillColor(Ink.muted).fontSize(9);
  doc.text(`Subtotal  ${formatUsd(invoice.totals.subtotal)}`, x, y, { width, align: "right" });
  doc.text(`Discount  ${formatUsd(invoice.totals.discountAmount)}`, x, doc.y + 2, { width, align: "right" });
  doc.text(`Tax  ${formatUsd(invoice.totals.taxAmount)}`, x, doc.y + 2, { width, align: "right" });
  y = doc.y + 8;
  doc.moveTo(x, y).lineTo(Col.right, y).strokeColor(Ink.ink).lineWidth(0.8).stroke();
  doc.fillColor(Ink.accent).fontSize(13);
  doc.text(`Total  ${formatUsd(invoice.totals.grandTotal)}`, x, y + 8, { width, align: "right" });
  return doc.y;
}

function drawNotesAndFields(doc: PDFKit.PDFDocument, invoice: Invoice, y: number): void {
  if (invoice.notes) {
    doc.fillColor(Ink.muted).fontSize(8).text("Notes", Page.margin, y);
    doc.fillColor(Ink.ink).fontSize(9).text(invoice.notes, Page.margin, y + 12, { width: 360 });
    y = doc.y + 12;
  }
  const visible = invoice.customFields.filter((field) => field.visible);
  for (const field of visible) {
    doc.fillColor(Ink.muted).fontSize(8).text(field.label, Page.margin, y);
    doc.fillColor(Ink.ink).fontSize(9).text(field.value, Page.margin + 120, y, { width: 280 });
    y = doc.y + 6;
  }
  doc.fillColor(Ink.muted).fontSize(8).text(`Due ${invoice.dueDate}`, Page.margin, Math.max(y, Page.bottom - 24));
}
