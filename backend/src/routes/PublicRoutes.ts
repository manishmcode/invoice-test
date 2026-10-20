import { Router } from "express";

/**
 * Public allow-list router. This API has no auth, so every mounted path is
 * public. Invoice `id` is still a capability URL; history is listed on GET /invoices.
 */
export function createPublicRoutes(invoiceRoutes: Router): Router {
  const publicRoutes = Router();

  /** GET /api/health — process liveness only. No database or internals. */
  publicRoutes.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  /** Mount Invoice HTTP surface at /api/invoices (list, last, create, read, replace, email). */
  publicRoutes.use("/invoices", invoiceRoutes);
  return publicRoutes;
}
