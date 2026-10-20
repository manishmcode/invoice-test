/**
 * @intent Wire Invoice layers and mount only the public router.
 * @in env, repositories, email adapter
 * @out Express app
 * @not file uploads
 */
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { EmailAdapter } from "./adapters/EmailAdapter";
import { env } from "./config/Env";
import { connectDatabase } from "./database/Database";
import { errorHandler } from "./middleware/ErrorHandler";
import { requestId } from "./middleware/RequestId";
import { InvoiceCustomFieldRepository } from "./database/repositories/InvoiceCustomFieldRepository";
import { InvoiceLineItemRepository } from "./database/repositories/InvoiceLineItemRepository";
import { InvoicePartyRepository } from "./database/repositories/InvoicePartyRepository";
import { InvoiceRepository } from "./database/repositories/InvoiceRepository";
import { InvoiceController } from "./modules/Invoice/controllers/InvoiceController";
import { createInvoiceRoutes } from "./modules/Invoice/InvoiceRoutes";
import { InvoiceService } from "./modules/Invoice/services/InvoiceService";
import { createPublicRoutes } from "./routes/PublicRoutes";

const app = express();

app.disable("x-powered-by");
app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigin,
  }),
);
app.use(express.json({ limit: "200kb" }));

const invoiceRepository = new InvoiceRepository();
const invoicePartyRepository = new InvoicePartyRepository();
const invoiceLineItemRepository = new InvoiceLineItemRepository();
const invoiceCustomFieldRepository = new InvoiceCustomFieldRepository();
const emailAdapter = new EmailAdapter();
const invoiceService = new InvoiceService(
  invoiceRepository,
  invoicePartyRepository,
  invoiceLineItemRepository,
  invoiceCustomFieldRepository,
  emailAdapter,
);
const invoiceController = new InvoiceController(invoiceService);

app.use("/api", createPublicRoutes(createInvoiceRoutes(invoiceController)));
app.use(errorHandler);

async function start(): Promise<void> {
  await connectDatabase();
  app.listen(env.port);
}

start().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
