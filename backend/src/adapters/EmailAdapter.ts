import nodemailer from "nodemailer";
import { env } from "../config/Env";
import { ErrorCode, ErrorMessage } from "../constants/ErrorCodes";
import { AppError } from "../middleware/AppError";
import { emailDomain, logInfo } from "../security/SafeLog";

export type InvoiceEmailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export type InvoiceEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  invoiceId: string;
  attachments: InvoiceEmailAttachment[];
};

export class EmailAdapter {
  isConfigured(): boolean {
    return Boolean(env.smtpHost && env.mailFrom);
  }

  async sendInvoiceEmail(message: InvoiceEmail): Promise<void> {
    if (!this.isConfigured()) {
      throw new AppError(503, ErrorCode.EmailUnconfigured, ErrorMessage.EmailUnconfigured);
    }

    const transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      requireTLS: env.smtpPort === 587,
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      auth:
        env.smtpUser || env.smtpPass
          ? { user: env.smtpUser, pass: env.smtpPass }
          : undefined,
    });

    await transporter.sendMail({
      from: env.mailFrom,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachments: message.attachments.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
      })),
    });

    logInfo("mail accepted", {
      invoiceId: message.invoiceId,
      domain: emailDomain(message.to),
      attachmentCount: String(message.attachments.length),
    });
  }
}
