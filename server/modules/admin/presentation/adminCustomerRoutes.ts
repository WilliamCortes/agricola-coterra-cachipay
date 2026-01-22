import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { db } from "../../../db";
import { customerInteractions, customerNotes, customers, orders } from "@shared/schema";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { JoseTokenService } from "../infrastructure/jwt/JoseTokenService";
import { createRequireAdminAuth } from "./http/requireAdminAuth";

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || null;
}

const listQuerySchema = z.object({
  q: z.string().optional(),
  segment: z.enum(["frequent", "wholesale", "occasional"]).optional(),
  isActive: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(20),
});

const customerInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  communicationPreferences: z.any().optional().nullable(),
});

const noteSchema = z.object({
  note: z.string().min(2).max(2000),
});

const interactionSchema = z.object({
  type: z.string().min(2).max(100),
  note: z.string().max(2000).optional().nullable(),
});

function deriveSegment(orderCount: number, total: number) {
  if (total >= 5_000_000) return "wholesale";
  if (orderCount >= 5) return "frequent";
  return "occasional";
}

export function registerAdminCustomerRoutes(app: Express) {
  const jwtSecret = getJwtSecret();
  const router = express.Router();

  if (!jwtSecret) {
    router.use((_req, res) => res.status(503).json({ message: "Admin authentication is not configured" }));
    app.use("/api/admin/customers", router);
    return;
  }

  const tokenService = new JoseTokenService(jwtSecret);
  const requireAdminAuth = createRequireAdminAuth(tokenService);

  router.get("/", requireAdminAuth, async (req, res) => {
    const input = listQuerySchema.parse(req.query);
    const offset = (input.page - 1) * input.pageSize;
    const search = input.q?.trim();

    const whereParts = [
      typeof input.isActive === "boolean" ? eq(customers.isActive, input.isActive) : undefined,
      search
        ? sql`${ilike(customers.name, `%${search}%`)} OR ${ilike(customers.email, `%${search}%`)} OR ${ilike(customers.phone, `%${search}%`)}`
        : undefined,
    ].filter(Boolean) as any[];

    const whereClause = whereParts.length ? and(...whereParts) : undefined;

    const [items, countRows] = await Promise.all([
      db
        .select({
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          isActive: customers.isActive,
          createdAt: customers.createdAt,
          orderCount: sql<number>`coalesce(count(${orders.id}), 0)`.mapWith(Number),
          totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)`.mapWith(Number),
        })
        .from(customers)
        .leftJoin(orders, eq(orders.customerId, customers.id))
        .where(whereClause)
        .groupBy(customers.id)
        .orderBy(desc(customers.createdAt))
        .limit(input.pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(customers).where(whereClause),
    ]);

    const withSegment = items
      .map((c) => ({ ...c, segment: deriveSegment(c.orderCount, c.totalSpent) }))
      .filter((c) => (input.segment ? c.segment === input.segment : true));

    return res.json({
      items: withSegment,
      page: input.page,
      pageSize: input.pageSize,
      total: countRows[0]?.count ?? 0,
    });
  });

  router.get("/:id", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const customerRows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    const customer = customerRows[0];
    if (!customer) return res.status(404).json({ message: "Not found" });

    const [customerOrders, notes, interactions] = await Promise.all([
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.customerId, id))
        .orderBy(desc(orders.createdAt))
        .limit(50),
      db
        .select({ id: customerNotes.id, note: customerNotes.note, createdAt: customerNotes.createdAt })
        .from(customerNotes)
        .where(eq(customerNotes.customerId, id))
        .orderBy(desc(customerNotes.createdAt))
        .limit(50),
      db
        .select({ id: customerInteractions.id, type: customerInteractions.type, note: customerInteractions.note, createdAt: customerInteractions.createdAt })
        .from(customerInteractions)
        .where(eq(customerInteractions.customerId, id))
        .orderBy(desc(customerInteractions.createdAt))
        .limit(50),
    ]);

    const orderCount = customerOrders.length;
    const totalSpent = customerOrders.reduce((acc, o) => acc + (o.total ?? 0), 0);
    const segment = deriveSegment(orderCount, totalSpent);

    return res.json({ customer, orders: customerOrders, notes, interactions, segment, orderCount, totalSpent });
  });

  router.post("/", requireAdminAuth, async (req, res) => {
    const input = customerInputSchema.parse(req.body);
    const inserted = await db
      .insert(customers)
      .values({
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        isActive: input.isActive,
        communicationPreferences: input.communicationPreferences ?? null,
      })
      .returning({ id: customers.id });
    return res.status(201).json({ id: inserted[0]!.id });
  });

  router.put("/:id", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const input = customerInputSchema.parse(req.body);

    await db
      .update(customers)
      .set({
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        isActive: input.isActive,
        communicationPreferences: input.communicationPreferences ?? null,
      })
      .where(eq(customers.id, id));

    return res.json({ success: true });
  });

  router.post("/:id/toggle-active", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const rows = await db.select({ isActive: customers.isActive }).from(customers).where(eq(customers.id, id)).limit(1);
    const row = rows[0];
    if (!row) return res.status(404).json({ message: "Not found" });

    await db.update(customers).set({ isActive: !row.isActive }).where(eq(customers.id, id));
    return res.json({ success: true });
  });

  router.post("/:id/notes", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const input = noteSchema.parse(req.body);
    await db.insert(customerNotes).values({
      customerId: id,
      note: input.note,
      createdByAdminUserId: (req as any).admin?.adminUserId ?? null,
    });
    return res.status(201).json({ success: true });
  });

  router.post("/:id/interactions", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const input = interactionSchema.parse(req.body);
    await db.insert(customerInteractions).values({ customerId: id, type: input.type, note: input.note ?? null });
    return res.status(201).json({ success: true });
  });

  app.use("/api/admin/customers", router);
}

