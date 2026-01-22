import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { db } from "../../../db";
import { customers, orderItems, orders, products } from "@shared/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { JoseTokenService } from "../infrastructure/jwt/JoseTokenService";
import { createRequireAdminAuth } from "./http/requireAdminAuth";

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || null;
}

const periodSchema = z.object({
  period: z.enum(["day", "week", "month"]).optional().default("day"),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const limitSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

function getFromTo(input: z.infer<typeof periodSchema>) {
  const now = new Date();
  const from =
    input.from
      ? new Date(input.from)
      : input.period === "day"
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : input.period === "week"
          ? new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)
          : new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const to = input.to ? new Date(input.to) : now;
  return { from, to };
}

function dateTrunc(period: "day" | "week" | "month") {
  const unit = period === "day" ? "day" : period === "week" ? "week" : "month";
  return sql<string>`date_trunc(${unit}, ${orders.createdAt})`;
}

export function registerAdminReportRoutes(app: Express) {
  const jwtSecret = getJwtSecret();
  const router = express.Router();

  if (!jwtSecret) {
    router.use((_req, res) => res.status(503).json({ message: "Admin authentication is not configured" }));
    app.use("/api/admin/reports", router);
    return;
  }

  const tokenService = new JoseTokenService(jwtSecret);
  const requireAdminAuth = createRequireAdminAuth(tokenService);

  router.get("/sales", requireAdminAuth, async (req, res) => {
    const input = periodSchema.parse(req.query);
    const { from, to } = getFromTo(input);
    const bucket = dateTrunc(input.period);

    const rows = await db
      .select({
        bucket: bucket,
        total: sql<number>`coalesce(sum(${orders.total}), 0)`.mapWith(Number),
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(orders)
      .where(and(sql`${orders.createdAt} >= ${from}`, sql`${orders.createdAt} <= ${to}`, sql`${orders.status} != 'canceled'`))
      .groupBy(bucket)
      .orderBy(asc(bucket));

    return res.json({ period: input.period, from, to, items: rows });
  });

  router.get("/top-products", requireAdminAuth, async (req, res) => {
    const input = limitSchema.parse(req.query);
    const rows = await db
      .select({
        name: orderItems.name,
        quantity: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`.mapWith(Number),
        revenue: sql<number>`coalesce(sum(${orderItems.total}), 0)`.mapWith(Number),
      })
      .from(orderItems)
      .groupBy(orderItems.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(input.limit);

    return res.json({ items: rows });
  });

  router.get("/top-customers", requireAdminAuth, async (req, res) => {
    const input = limitSchema.parse(req.query);
    const rows = await db
      .select({
        customerId: customers.id,
        name: customers.name,
        phone: customers.phone,
        total: sql<number>`coalesce(sum(${orders.total}), 0)`.mapWith(Number),
        count: sql<number>`count(${orders.id})`.mapWith(Number),
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(sql`${orders.status} != 'canceled'`)
      .groupBy(customers.id)
      .orderBy(desc(sql`sum(${orders.total})`))
      .limit(input.limit);

    return res.json({ items: rows });
  });

  router.get("/inventory-value", requireAdminAuth, async (_req, res) => {
    const rows = await db
      .select({
        totalCost: sql<number>`coalesce(sum(coalesce(${products.stock},0) * coalesce(${products.costPrice},0)), 0)`.mapWith(Number),
      })
      .from(products);
    return res.json({ totalCost: rows[0]!.totalCost });
  });

  router.get("/margin-by-product", requireAdminAuth, async (req, res) => {
    const input = limitSchema.parse(req.query);
    const rows = await db
      .select({
        productId: products.id,
        name: products.name,
        revenue: sql<number>`coalesce(sum(${orderItems.total}), 0)`.mapWith(Number),
        cost: sql<number>`coalesce(sum(${orderItems.quantity} * coalesce(${products.costPrice},0)), 0)`.mapWith(Number),
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .groupBy(products.id)
      .orderBy(desc(sql`sum(${orderItems.total})`))
      .limit(input.limit);

    const items = rows.map((r) => ({ ...r, margin: (r.revenue ?? 0) - (r.cost ?? 0) }));
    return res.json({ items });
  });

  router.get("/sales.csv", requireAdminAuth, async (req, res) => {
    const input = periodSchema.parse(req.query);
    const { from, to } = getFromTo(input);
    const bucket = dateTrunc(input.period);

    const rows = await db
      .select({
        bucket: bucket,
        total: sql<number>`coalesce(sum(${orders.total}), 0)`.mapWith(Number),
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(orders)
      .where(and(sql`${orders.createdAt} >= ${from}`, sql`${orders.createdAt} <= ${to}`, sql`${orders.status} != 'canceled'`))
      .groupBy(bucket)
      .orderBy(asc(bucket));

    const header = ["bucket", "total", "count"];
    const csv = [header.join(","), ...rows.map((r) => `${escapeCsv(String(r.bucket))},${r.total},${r.count}`)].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="sales.csv"');
    return res.send(csv);
  });

  app.use("/api/admin/reports", router);
}

function escapeCsv(value: string) {
  const safe = value.replace(/"/g, '""');
  if (/[",\n]/.test(safe)) return `"${safe}"`;
  return safe;
}

