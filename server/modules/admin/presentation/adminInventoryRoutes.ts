import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { db } from "../../../db.js";
import { inventoryMovements, products, stockLevels, warehouses } from "../../../../shared/schema.js";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { JoseTokenService } from "../infrastructure/jwt/JoseTokenService.js";
import { createRequireAdminAuth } from "./http/requireAdminAuth.js";

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || null;
}

const overviewQuerySchema = z.object({
  q: z.string().optional(),
  warehouseId: z.coerce.number().optional(),
});

const movementsQuerySchema = z.object({
  warehouseId: z.coerce.number().optional(),
  productId: z.coerce.number().optional(),
  type: z.enum(["in", "out", "adjust"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(20),
});

const createMovementSchema = z.object({
  productId: z.number().int(),
  warehouseId: z.number().int(),
  type: z.enum(["in", "out", "adjust"]),
  quantity: z.number().int().min(0),
  reason: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const expiringQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

async function ensureWarehouseExists(warehouseId: number) {
  const rows = await db.select({ id: warehouses.id }).from(warehouses).where(eq(warehouses.id, warehouseId)).limit(1);
  return Boolean(rows[0]);
}

async function ensureStockLevelTx(tx: any, productId: number, warehouseId: number) {
  const rows = await tx
    .select({ id: stockLevels.id, quantity: stockLevels.quantity })
    .from(stockLevels)
    .where(and(eq(stockLevels.productId, productId), eq(stockLevels.warehouseId, warehouseId)))
    .limit(1);
  if (rows[0]) return rows[0];

  const inserted = await tx
    .insert(stockLevels)
    .values({ productId, warehouseId, quantity: 0 })
    .returning({ id: stockLevels.id, quantity: stockLevels.quantity });
  return inserted[0]!;
}

export function registerAdminInventoryRoutes(app: Express) {
  const jwtSecret = getJwtSecret();
  const router = express.Router();

  if (!jwtSecret) {
    router.use((_req, res) => res.status(503).json({ message: "Admin authentication is not configured" }));
    app.use("/api/admin/inventory", router);
    return;
  }

  const tokenService = new JoseTokenService(jwtSecret);
  const requireAdminAuth = createRequireAdminAuth(tokenService);

  router.get("/warehouses", requireAdminAuth, async (_req, res) => {
    const rows = await db.select().from(warehouses).orderBy(asc(warehouses.id));
    return res.json({ items: rows });
  });

  router.get("/overview", requireAdminAuth, async (req, res) => {
    const input = overviewQuerySchema.parse(req.query);
    const warehouseId = input.warehouseId;
    const search = input.q?.trim();

    const whereParts = [
      search
        ? sql`${ilike(products.name, `%${search}%`)} OR ${ilike(products.sku, `%${search}%`)} OR ${ilike(products.barcode, `%${search}%`)}`
        : undefined,
    ].filter(Boolean) as any[];

    const whereClause = whereParts.length ? and(...whereParts) : undefined;

    if (warehouseId) {
      const clause = whereClause ? and(eq(stockLevels.warehouseId, warehouseId), whereClause) : eq(stockLevels.warehouseId, warehouseId);
      const rows = await db
        .select({
          productId: products.id,
          name: products.name,
          sku: products.sku,
          barcode: products.barcode,
          stockMin: products.stockMin,
          stockMax: products.stockMax,
          expiresAt: products.expiresAt,
          isActive: products.isActive,
          quantity: stockLevels.quantity,
        })
        .from(stockLevels)
        .innerJoin(products, eq(stockLevels.productId, products.id))
        .where(clause)
        .orderBy(asc(products.name));

      return res.json({ items: rows });
    }

    const rows = await db
      .select({
        productId: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
        stockMin: products.stockMin,
        stockMax: products.stockMax,
        expiresAt: products.expiresAt,
        isActive: products.isActive,
        quantity: products.stock,
      })
      .from(products)
      .where(whereClause)
      .orderBy(asc(products.name));

    return res.json({ items: rows });
  });

  router.get("/movements", requireAdminAuth, async (req, res) => {
    const input = movementsQuerySchema.parse(req.query);
    const offset = (input.page - 1) * input.pageSize;

    const whereParts = [
      input.warehouseId ? eq(inventoryMovements.warehouseId, input.warehouseId) : undefined,
      input.productId ? eq(inventoryMovements.productId, input.productId) : undefined,
      input.type ? eq(inventoryMovements.type, input.type) : undefined,
    ].filter(Boolean);

    const whereClause = whereParts.length ? and(...whereParts) : undefined;

    const [items, countRows] = await Promise.all([
      db
        .select({
          id: inventoryMovements.id,
          createdAt: inventoryMovements.createdAt,
          type: inventoryMovements.type,
          quantity: inventoryMovements.quantity,
          reason: inventoryMovements.reason,
          notes: inventoryMovements.notes,
          productId: inventoryMovements.productId,
          warehouseId: inventoryMovements.warehouseId,
        })
        .from(inventoryMovements)
        .where(whereClause)
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(input.pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(inventoryMovements)
        .where(whereClause),
    ]);

    return res.json({
      items,
      page: input.page,
      pageSize: input.pageSize,
      total: countRows[0]?.count ?? 0,
    });
  });

  router.post("/movements", requireAdminAuth, async (req, res) => {
    const input = createMovementSchema.parse(req.body);
    const warehouseExists = await ensureWarehouseExists(input.warehouseId);
    if (!warehouseExists) return res.status(400).json({ message: "Invalid warehouseId" });

    const result = await db.transaction(async (tx) => {
      const level = await ensureStockLevelTx(tx, input.productId, input.warehouseId);
      const currentQty = level.quantity;

      let nextQty = currentQty;
      if (input.type === "in") nextQty = currentQty + input.quantity;
      if (input.type === "out") nextQty = currentQty - input.quantity;
      if (input.type === "adjust") nextQty = input.quantity;

      if (nextQty < 0) {
        const err = new Error("Insufficient stock");
        (err as any).status = 400;
        throw err;
      }

      await tx
        .update(stockLevels)
        .set({ quantity: nextQty, updatedAt: new Date() })
        .where(and(eq(stockLevels.productId, input.productId), eq(stockLevels.warehouseId, input.warehouseId)));

      await tx.insert(inventoryMovements).values({
        productId: input.productId,
        warehouseId: input.warehouseId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason ?? null,
        notes: input.notes ?? null,
        createdByAdminUserId: (req as any).admin?.adminUserId ?? null,
      });

      const sumRows = await tx
        .select({ total: sql<number>`coalesce(sum(${stockLevels.quantity}), 0)`.mapWith(Number) })
        .from(stockLevels)
        .where(eq(stockLevels.productId, input.productId));

      await tx.update(products).set({ stock: sumRows[0]!.total }).where(eq(products.id, input.productId));
      return { nextQty, total: sumRows[0]!.total };
    });

    return res.status(201).json({ success: true, ...result });
  });

  router.get("/expiring", requireAdminAuth, async (req, res) => {
    const input = expiringQuerySchema.parse(req.query);
    const now = new Date();
    const limitDate = new Date(now.getTime() + input.days * 24 * 60 * 60 * 1000);

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        expiresAt: products.expiresAt,
        stock: products.stock,
      })
      .from(products)
      .where(and(sql`${products.expiresAt} is not null`, sql`${products.expiresAt} <= ${limitDate}`))
      .orderBy(asc(products.expiresAt));

    return res.json({ items: rows });
  });

  router.get("/export.csv", requireAdminAuth, async (_req, res) => {
    const rows = await db
      .select({
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
        stock: products.stock,
        stockMin: products.stockMin,
        stockMax: products.stockMax,
        isActive: products.isActive,
      })
      .from(products)
      .orderBy(asc(products.name));

    const header = ["name", "sku", "barcode", "stock", "stock_min", "stock_max", "is_active"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          escapeCsv(r.name),
          escapeCsv(r.sku ?? ""),
          escapeCsv(r.barcode ?? ""),
          String(r.stock ?? 0),
          String(r.stockMin ?? 0),
          String(r.stockMax ?? ""),
          r.isActive ? "true" : "false",
        ].join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="inventory.csv"');
    return res.send(csv);
  });

  app.use("/api/admin/inventory", router);
}

function escapeCsv(value: string) {
  const safe = value.replace(/"/g, '""');
  if (/[",\n]/.test(safe)) return `"${safe}"`;
  return safe;
}
