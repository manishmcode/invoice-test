/**
 * @intent Persist invoices and send the saved snapshot by email with a PDF.
 * @in draft bodies, recipient address
 * @out Invoice records, SMTP send
 * @not Express req/res, Knex table DDL, file uploads
 */
import { randomUUID } from "node:crypto";
import type {
  CreateInvoiceBody,
  Invoice,
  InvoiceListResponse,
} from "@hearth/invoice-types/modules/Invoice";
import { CalculationError, calculateInvoice } from "@hearth/invoice-types/modules/Invoice";
import type { EmailAdapter, InvoiceEmailAttachment } from "../../../adapters/EmailAdapter";
import { env } from "../../../config/Env";
import { ErrorCode, ErrorMessage, UuidPattern } from "../../../constants/ErrorCodes";
import { assembleInvoiceDraft } from "../../../database/entities/Invoice";
import { partiesFromInvoice } from "../../../database/entities/InvoiceParty";
import type { InvoiceCustomFieldRepository } from "../../../database/repositories/InvoiceCustomFieldRepository";
import type { InvoiceLineItemRepository } from "../../../database/repositories/InvoiceLineItemRepository";
import type { InvoicePartyRepository } from "../../../database/repositories/InvoicePartyRepository";
import type { InvoiceRepository } from "../../../database/repositories/InvoiceRepository";
import { AppError } from "../../../middleware/AppError";
import { logError, logInfo } from "../../../security/SafeLog";
import { renderInvoiceEmail } from "../RenderInvoiceEmail";
import { renderInvoicePdf } from "../RenderInvoicePdf";

/** Domain orchestration. Uses database repositories. Never accepts Express req/res. */
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoicePartyRepository: InvoicePartyRepository,
    private readonly invoiceLineItemRepository: InvoiceLineItemRepository,
    private readonly invoiceCustomFieldRepository: InvoiceCustomFieldRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  async listInvoices(): Promise<InvoiceListResponse> {
    const invoices = await this.invoiceRepository.withTransaction(async (trx) => {
      return this.invoiceRepository.listSummaries(trx);
    });
    return {
      invoices,
      lastInvoice: invoices[0] ?? null,
    };
  }

  async createInvoice(draft: CreateInvoiceBody, id: string = randomUUID()): Promise<Invoice> {
    const timestamp = new Date().toISOString();
    const invoice = this.withTotals(draft, id, timestamp, timestamp);
    await this.persistInvoice(invoice);
    return invoice;
  }

  async getInvoice(id: string): Promise<Invoice> {
    return this.requireInvoice(id);
  }

  async getLastInvoice(): Promise<Invoice> {
    const latest = await this.invoiceRepository.withTransaction(async (trx) => {
      return this.invoiceRepository.findLatestHeader(trx);
    });
    if (!latest) {
      throw new AppError(404, ErrorCode.NotFound, ErrorMessage.InvoiceNotFound);
    }
    return this.requireInvoice(latest.id);
  }

  async updateInvoice(id: string, draft: CreateInvoiceBody): Promise<Invoice> {
    if (!UuidPattern.test(id)) {
      throw new AppError(404, ErrorCode.NotFound, ErrorMessage.InvoiceNotFound);
    }
    const existing = await this.invoiceRepository.withTransaction(async (trx) => {
      return this.invoiceRepository.findHeader(trx, id);
    });
    if (!existing) {
      throw new AppError(404, ErrorCode.NotFound, ErrorMessage.InvoiceNotFound);
    }
    const invoice = this.withTotals(draft, existing.id, existing.createdAt, new Date().toISOString());
    await this.persistInvoice(invoice);
    return invoice;
  }

  async emailInvoice(id: string, to: string): Promise<{ accepted: true }> {
    const invoice = await this.requireInvoice(id);

    if (env.mailAllowlist.length > 0 && !env.mailAllowlist.includes(to.toLowerCase())) {
      throw new AppError(400, ErrorCode.EmailNotAllowed, ErrorMessage.EmailNotAllowed);
    }

    if (!this.emailAdapter.isConfigured()) {
      throw new AppError(503, ErrorCode.EmailUnconfigured, ErrorMessage.EmailUnconfigured);
    }

    const rendered = renderInvoiceEmail(invoice);
    const attachments = await this.buildEmailAttachments(invoice);
    await this.emailAdapter.sendInvoiceEmail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      invoiceId: invoice.id,
      attachments,
    });

    return { accepted: true };
  }

  private async persistInvoice(invoice: Invoice): Promise<void> {
    await this.invoiceRepository.withTransaction(async (trx) => {
      await this.invoiceRepository.upsertHeader(trx, invoice);
      await this.invoicePartyRepository.replaceForInvoice(trx, invoice.id, partiesFromInvoice(invoice));
      await this.invoiceLineItemRepository.replaceForInvoice(trx, invoice.id, invoice.lineItems);
      await this.invoiceCustomFieldRepository.replaceForInvoice(trx, invoice.id, invoice.customFields);
    });
  }

  private async requireInvoice(id: string): Promise<Invoice> {
    if (!UuidPattern.test(id)) {
      throw new AppError(404, ErrorCode.NotFound, ErrorMessage.InvoiceNotFound);
    }

    const loaded = await this.invoiceRepository.withTransaction(async (trx) => {
      const header = await this.invoiceRepository.findHeader(trx, id);
      if (!header) {
        return null;
      }
      const parties = await this.invoicePartyRepository.listByInvoiceId(trx, id);
      const lineItems = await this.invoiceLineItemRepository.listByInvoiceId(trx, id);
      const customFields = await this.invoiceCustomFieldRepository.listByInvoiceId(trx, id);
      return { header, parties, lineItems, customFields };
    });

    if (!loaded) {
      throw new AppError(404, ErrorCode.NotFound, ErrorMessage.InvoiceNotFound);
    }

    try {
      const draft = assembleInvoiceDraft(loaded);
      return this.withTotals(draft, loaded.header.id, loaded.header.createdAt, loaded.header.updatedAt);
    } catch (error) {
      if (error instanceof CalculationError) {
        throw new AppError(400, ErrorCode.ValidationError, ErrorMessage.RequestInvalid, error.fields);
      }
      throw new AppError(500, ErrorCode.InternalError, ErrorMessage.InternalError);
    }
  }

  private async buildEmailAttachments(invoice: Invoice): Promise<InvoiceEmailAttachment[]> {
    const safeNumber = invoice.number.replace(/[^\w.-]+/g, "-");
    let pdf: Buffer;
    try {
      pdf = await renderInvoicePdf(invoice);
    } catch (error) {
      logError("invoice pdf failed", error);
      throw new AppError(500, ErrorCode.InternalError, ErrorMessage.InternalError);
    }
    logInfo("invoice pdf rendered", {
      invoiceId: invoice.id,
      bytes: String(pdf.length),
    });
    return [
      {
        filename: `Invoice-${safeNumber}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ];
  }

  private withTotals(
    draft: CreateInvoiceBody,
    id: string,
    createdAt: string,
    updatedAt: string,
  ): Invoice {
    try {
      const totals = calculateInvoice(draft);
      return { ...draft, id, totals, createdAt, updatedAt };
    } catch (error) {
      if (error instanceof CalculationError) {
        throw new AppError(400, ErrorCode.ValidationError, ErrorMessage.RequestInvalid, error.fields);
      }
      throw error;
    }
  }
}
