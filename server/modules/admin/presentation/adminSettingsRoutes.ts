import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { db } from "../../../db";
import { adminActivityLogs, businessSettings } from "@shared/schema";
import { asc, desc, sql } from "drizzle-orm";
import { JoseTokenService } from "../infrastructure/jwt/JoseTokenService";
import { createRequireAdminAuth } from "./http/requireAdminAuth";

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || null;
}

const updateSchema = z.object({
  businessName: z.string().min(2),
  nit: z.string().max(60).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(60).optional().nullable(),
  socialLinks: z.any().optional().nullable(),
  paymentMethods: z.any().optional().nullable(),
  shippingCosts: z.any().optional().nullable(),
  autoMessages: z.any().optional().nullable(),
});

const activityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(20),
});

export function registerAdminSettingsRoutes(app: Express) {
  const jwtSecret = getJwtSecret();
  const router = express.Router();

  if (!jwtSecret) {
    router.use((_req, res) => res.status(503).json({ message: "Admin authentication is not configured" }));
    app.use("/api/admin/settings", router);
    return;
  }

  const tokenService = new JoseTokenService(jwtSecret);
  const requireAdminAuth = createRequireAdminAuth(tokenService);

  router.get("/", requireAdminAuth, async (_req, res) => {
    const rows = await db.select().from(businessSettings).orderBy(asc(businessSettings.id)).limit(1);
    if (rows[0]) return res.json({ settings: rows[0] });

    const inserted = await db
      .insert(businessSettings)
      .values({
        businessName: "Agrícola Coterra",
        nit: null,
        address: null,
        phone: null,
        socialLinks: null,
        paymentMethods: null,
        shippingCosts: null,
        autoMessages: null,
      })
      .returning();

    return res.json({ settings: inserted[0] });
  });

  router.put("/", requireAdminAuth, async (req, res) => {
    const input = updateSchema.parse(req.body);
    const rows = await db.select().from(businessSettings).orderBy(asc(businessSettings.id)).limit(1);
    if (!rows[0]) {
      const inserted = await db
        .insert(businessSettings)
        .values({
          businessName: input.businessName,
          nit: input.nit ?? null,
          address: input.address ?? null,
          phone: input.phone ?? null,
          socialLinks: input.socialLinks ?? null,
          paymentMethods: input.paymentMethods ?? null,
          shippingCosts: input.shippingCosts ?? null,
          autoMessages: input.autoMessages ?? null,
        })
        .returning();
      return res.json({ settings: inserted[0] });
    }

    await db
      .update(businessSettings)
      .set({
        businessName: input.businessName,
        nit: input.nit ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null,
        socialLinks: input.socialLinks ?? null,
        paymentMethods: input.paymentMethods ?? null,
        shippingCosts: input.shippingCosts ?? null,
        autoMessages: input.autoMessages ?? null,
        updatedAt: new Date(),
      })
      .where(sql`${businessSettings.id} = ${rows[0].id}`);

    const updated = await db.select().from(businessSettings).orderBy(asc(businessSettings.id)).limit(1);
    return res.json({ settings: updated[0] });
  });

  router.get("/activity", requireAdminAuth, async (req, res) => {
    const input = activityQuerySchema.parse(req.query);
    const offset = (input.page - 1) * input.pageSize;

    const [items, countRows] = await Promise.all([
      db
        .select({
          id: adminActivityLogs.id,
          action: adminActivityLogs.action,
          ip: adminActivityLogs.ip,
          userAgent: adminActivityLogs.userAgent,
          createdAt: adminActivityLogs.createdAt,
        })
        .from(adminActivityLogs)
        .orderBy(desc(adminActivityLogs.createdAt))
        .limit(input.pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(adminActivityLogs),
    ]);

    return res.json({ items, page: input.page, pageSize: input.pageSize, total: countRows[0]?.count ?? 0 });
  });

  app.use("/api/admin/settings", router);
}

