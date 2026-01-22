import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { db } from "../../../db.js";
import { customers, orderItems, orderReturns, orderStatusHistory, orders } from "../../../../shared/schema.js";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { JoseTokenService } from "../infrastructure/jwt/JoseTokenService.js";
import { createRequireAdminAuth } from "./http/requireAdminAuth.js";

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || null;
}

const kanbanQuerySchema = z.object({
  q: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "shipped", "delivered", "canceled"]),
  note: z.string().max(2000).optional().nullable(),
});

const assignSchema = z.object({
  assignedDelivery: z.string().max(200).optional().nullable(),
});

const shippingGuideSchema = z.object({
  shippingGuideNumber: z.string().min(3).max(80).optional().nullable(),
});

const returnSchema = z.object({
  reason: z.string().min(3).max(500),
  amount: z.number().int().min(0).optional().default(0),
});

const summaryQuerySchema = z.object({
  period: z.enum(["day", "week", "month"]).optional().default("day"),
});

export function registerAdminOrderRoutes(app: Express) {
  const jwtSecret = getJwtSecret();
  const router = express.Router();

  if (!jwtSecret) {
    router.use((_req, res) => res.status(503).json({ message: "Admin authentication is not configured" }));
    app.use("/api/admin/orders", router);
    return;
  }

  const tokenService = new JoseTokenService(jwtSecret);
  const requireAdminAuth = createRequireAdminAuth(tokenService);

  router.get("/kanban", requireAdminAuth, async (req, res) => {
    const input = kanbanQuerySchema.parse(req.query);
    const search = input.q?.trim();

    const whereParts = [
      search
        ? sql`${ilike(orders.orderNumber, `%${search}%`)} OR ${ilike(customers.name, `%${search}%`)} OR ${ilike(customers.phone, `%${search}%`)}`
        : undefined,
      input.from ? sql`${orders.createdAt} >= ${new Date(input.from)}` : undefined,
      input.to ? sql`${orders.createdAt} <= ${new Date(input.to)}` : undefined,
    ].filter(Boolean) as any[];

    const whereClause = whereParts.length ? and(...whereParts) : undefined;

    const rows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        customerName: customers.name,
        customerPhone: customers.phone,
        assignedDelivery: orders.assignedDelivery,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt));

    return res.json({ items: rows });
  });

  router.get("/:id", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const orderRows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        notes: orders.notes,
        deliveryAddress: orders.deliveryAddress,
        assignedDelivery: orders.assignedDelivery,
        shippingGuideNumber: orders.shippingGuideNumber,
        createdAt: orders.createdAt,
        customerId: orders.customerId,
      })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    const order = orderRows[0];
    if (!order) return res.status(404).json({ message: "Not found" });

    const [items, history, returns] = await Promise.all([
      db
        .select({
          id: orderItems.id,
          name: orderItems.name,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          total: orderItems.total,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, id))
        .orderBy(asc(orderItems.id)),
      db
        .select({
          id: orderStatusHistory.id,
          fromStatus: orderStatusHistory.fromStatus,
          toStatus: orderStatusHistory.toStatus,
          note: orderStatusHistory.note,
          createdAt: orderStatusHistory.createdAt,
        })
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, id))
        .orderBy(desc(orderStatusHistory.createdAt)),
      db
        .select({
          id: orderReturns.id,
          reason: orderReturns.reason,
          amount: orderReturns.amount,
          createdAt: orderReturns.createdAt,
        })
        .from(orderReturns)
        .where(eq(orderReturns.orderId, id))
        .orderBy(desc(orderReturns.createdAt)),
    ]);

    return res.json({ order, items, history, returns });
  });

  router.post("/:id/status", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const input = statusSchema.parse(req.body);

    await db.transaction(async (tx) => {
      const rows = await tx.select({ status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1);
      const current = rows[0]?.status ?? null;
      if (!current) {
        const err = new Error("Not found");
        (err as any).status = 404;
        throw err;
      }

      await tx.update(orders).set({ status: input.status }).where(eq(orders.id, id));
      await tx.insert(orderStatusHistory).values({
        orderId: id,
        fromStatus: current,
        toStatus: input.status,
        note: input.note ?? null,
        changedByAdminUserId: (req as any).admin?.adminUserId ?? null,
      });
    });

    return res.json({ success: true });
  });

  router.post("/:id/assign-delivery", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const input = assignSchema.parse(req.body);
    await db.update(orders).set({ assignedDelivery: input.assignedDelivery ?? null }).where(eq(orders.id, id));
    return res.json({ success: true });
  });

  router.post("/:id/shipping-guide", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const input = shippingGuideSchema.parse(req.body);
    await db.update(orders).set({ shippingGuideNumber: input.shippingGuideNumber ?? null }).where(eq(orders.id, id));
    return res.json({ success: true });
  });

  router.post("/:id/return", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const input = returnSchema.parse(req.body);
    await db.insert(orderReturns).values({ orderId: id, reason: input.reason, amount: input.amount });
    return res.status(201).json({ success: true });
  });

  router.get("/:id/print", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).send("Invalid id");

    const orderRows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        deliveryAddress: orders.deliveryAddress,
      })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    const order = orderRows[0];
    if (!order) return res.status(404).send("Not found");

    const items = await db
      .select({ name: orderItems.name, quantity: orderItems.quantity, unitPrice: orderItems.unitPrice, total: orderItems.total })
      .from(orderItems)
      .where(eq(orderItems.orderId, id))
      .orderBy(asc(orderItems.id));

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Order ${escapeHtml(order.orderNumber)}</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; }
      h1 { margin: 0 0 8px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background: #f6f6f6; }
      .muted { color: #666; font-size: 12px; }
      @media print { button { display: none; } body { padding: 0; } }
    </style>
  </head>
  <body>
    <button onclick="window.print()">Print</button>
    <h1>Pedido ${escapeHtml(order.orderNumber)}</h1>
    <div class="muted">Estado: ${escapeHtml(order.status)} · Fecha: ${new Date(order.createdAt).toLocaleString()}</div>
    <div class="muted">Dirección: ${escapeHtml(order.deliveryAddress ?? "")}</div>
    <table>
      <thead><tr><th>Producto</th><th>Cantidad</th><th>Unitario</th><th>Total</th></tr></thead>
      <tbody>
        ${items
          .map(
            (i) =>
              `<tr><td>${escapeHtml(i.name)}</td><td>${i.quantity}</td><td>${formatMoney(i.unitPrice)}</td><td>${formatMoney(i.total)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
    <h3>Total: ${formatMoney(order.total)}</h3>
  </body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  });

  router.get("/summary/financial", requireAdminAuth, async (req, res) => {
    const input = summaryQuerySchema.parse(req.query);
    const now = new Date();
    const from =
      input.period === "day"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : input.period === "week"
          ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          : new Date(now.getFullYear(), now.getMonth(), 1);

    const rows = await db
      .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)`.mapWith(Number), count: sql<number>`count(*)`.mapWith(Number) })
      .from(orders)
      .where(and(sql`${orders.createdAt} >= ${from}`, sql`${orders.status} != 'canceled'`));

    return res.json({ period: input.period, from, total: rows[0]!.total, count: rows[0]!.count });
  });

  app.use("/api/admin/orders", router);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

function formatMoney(centsOrPesos: number) {
  return `$${(centsOrPesos / 100).toFixed(2)}`;
}
