import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { db } from "../../../db.js";
import { productImages, products } from "../../../../shared/schema.js";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { JoseTokenService } from "../infrastructure/jwt/JoseTokenService.js";
import { createRequireAdminAuth } from "./http/requireAdminAuth.js";
import crypto from "crypto";

const listQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  isActive: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  sortBy: z
    .enum(["name", "price", "stock", "createdAt", "isActive"])
    .optional()
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(20),
});

const productInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.number().int().nullable().optional(),
  sku: z.string().min(3).max(40).optional().nullable(),
  price: z.number().int().min(0),
  costPrice: z.number().int().min(0).optional().default(0),
  promoPrice: z.number().int().min(0).nullable().optional(),
  stock: z.number().int().min(0),
  stockMin: z.number().int().min(0).optional().default(0),
  stockMax: z.number().int().min(0).nullable().optional(),
  unit: z.string().max(40).nullable().optional(),
  supplier: z.string().max(200).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
  isActive: z.boolean().optional().default(true),
  imageUrls: z.array(z.string().url()).optional().default([]),
});

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || null;
}

function normalizeSku(input: string) {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function generateUniqueSku(base: string) {
  const prefix = normalizeSku(base) || "SKU";
  for (let i = 0; i < 10; i += 1) {
    const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidate = normalizeSku(`${prefix}-${suffix}`);
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, candidate))
      .limit(1);
    if (!existing[0]) return candidate;
  }
  return normalizeSku(`${prefix}-${Date.now()}`);
}

async function upsertProductImages(productId: number, urls: string[]) {
  await db.delete(productImages).where(eq(productImages.productId, productId));
  if (urls.length === 0) {
    await db.update(products).set({ imageUrl: null }).where(eq(products.id, productId));
    return;
  }

  const rows = urls.map((url, idx) => ({
    productId,
    url,
    sortOrder: idx,
  }));
  await db.insert(productImages).values(rows);
  await db.update(products).set({ imageUrl: urls[0] }).where(eq(products.id, productId));
}

export function registerAdminProductRoutes(app: Express) {
  const jwtSecret = getJwtSecret();
  const router = express.Router();

  if (!jwtSecret) {
    router.use((_req, res) => res.status(503).json({ message: "Admin authentication is not configured" }));
    app.use("/api/admin/products", router);
    return;
  }

  const tokenService = new JoseTokenService(jwtSecret);
  const requireAdminAuth = createRequireAdminAuth(tokenService);

  router.get("/", requireAdminAuth, async (req, res) => {
    const input = listQuerySchema.parse(req.query);
    const offset = (input.page - 1) * input.pageSize;

    const search = input.q?.trim();
    const searchClause = search
      ? or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`),
          ilike(products.sku, `%${search}%`)
        )
      : undefined;

    const whereParts = [
      input.categoryId ? eq(products.categoryId, input.categoryId) : undefined,
      typeof input.isActive === "boolean" ? eq(products.isActive, input.isActive) : undefined,
      searchClause,
    ].filter(Boolean);

    const whereClause = whereParts.length ? and(...whereParts) : undefined;

    const orderBy =
      input.sortBy === "name"
        ? input.sortDir === "asc"
          ? asc(products.name)
          : desc(products.name)
        : input.sortBy === "price"
          ? input.sortDir === "asc"
            ? asc(products.price)
            : desc(products.price)
          : input.sortBy === "stock"
            ? input.sortDir === "asc"
              ? asc(products.stock)
              : desc(products.stock)
            : input.sortBy === "isActive"
              ? input.sortDir === "asc"
                ? asc(products.isActive)
                : desc(products.isActive)
              : input.sortDir === "asc"
                ? asc(products.createdAt)
                : desc(products.createdAt);

    const [items, countRows] = await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          categoryId: products.categoryId,
          price: products.price,
          promoPrice: products.promoPrice,
          stock: products.stock,
          stockMin: products.stockMin,
          isActive: products.isActive,
          imageUrl: products.imageUrl,
          createdAt: products.createdAt,
        })
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(input.pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(products)
        .where(whereClause),
    ]);

    return res.json({
      items,
      page: input.page,
      pageSize: input.pageSize,
      total: countRows[0]?.count ?? 0,
    });
  });

  router.get("/:id", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
    const product = rows[0];
    if (!product) return res.status(404).json({ message: "Not found" });

    const images = await db
      .select({ id: productImages.id, url: productImages.url, sortOrder: productImages.sortOrder })
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder));

    return res.json({ product, images });
  });

  router.post("/", requireAdminAuth, async (req, res) => {
    const input = productInputSchema.parse(req.body);
    const sku = input.sku ? normalizeSku(input.sku) : await generateUniqueSku(input.name);
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    const inserted = await db
      .insert(products)
      .values({
        name: input.name,
        description: input.description,
        categoryId: input.categoryId ?? null,
        sku,
        price: input.price,
        costPrice: input.costPrice,
        promoPrice: input.promoPrice ?? null,
        stock: input.stock,
        stockMin: input.stockMin,
        stockMax: input.stockMax ?? null,
        unit: input.unit ?? null,
        supplier: input.supplier ?? null,
        expiresAt,
        tags: input.tags,
        isActive: input.isActive,
      })
      .returning({ id: products.id });

    const productId = inserted[0]!.id;
    await upsertProductImages(productId, input.imageUrls);

    return res.status(201).json({ id: productId });
  });

  router.put("/:id", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const input = productInputSchema.parse(req.body);
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    const existingRows = await db.select({ sku: products.sku }).from(products).where(eq(products.id, id)).limit(1);
    const existingSku = existingRows[0]?.sku ?? null;
    const sku = input.sku ? normalizeSku(input.sku) : existingSku || (await generateUniqueSku(input.name));

    await db
      .update(products)
      .set({
        name: input.name,
        description: input.description,
        categoryId: input.categoryId ?? null,
        sku,
        price: input.price,
        costPrice: input.costPrice,
        promoPrice: input.promoPrice ?? null,
        stock: input.stock,
        stockMin: input.stockMin,
        stockMax: input.stockMax ?? null,
        unit: input.unit ?? null,
        supplier: input.supplier ?? null,
        expiresAt,
        tags: input.tags,
        isActive: input.isActive,
      })
      .where(eq(products.id, id));

    await upsertProductImages(id, input.imageUrls);

    return res.json({ success: true });
  });

  router.post("/:id/duplicate", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
    const source = rows[0];
    if (!source) return res.status(404).json({ message: "Not found" });

    const sku = await generateUniqueSku(source.name);
    const inserted = await db
      .insert(products)
      .values({
        sku,
        name: `${source.name} (Copia)`,
        description: source.description,
        categoryId: source.categoryId,
        price: source.price,
        imageUrl: source.imageUrl,
        stock: source.stock,
        costPrice: source.costPrice,
        promoPrice: source.promoPrice,
        stockMin: source.stockMin,
        stockMax: source.stockMax,
        unit: source.unit,
        supplier: source.supplier,
        expiresAt: source.expiresAt,
        tags: source.tags,
        isActive: source.isActive,
      })
      .returning({ id: products.id });

    const newId = inserted[0]!.id;
    const imgs = await db
      .select({ url: productImages.url, sortOrder: productImages.sortOrder })
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder));
    await upsertProductImages(newId, imgs.map((i) => i.url));

    return res.status(201).json({ id: newId });
  });

  router.post("/:id/toggle-active", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

    const rows = await db
      .select({ isActive: products.isActive })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return res.status(404).json({ message: "Not found" });

    await db.update(products).set({ isActive: !row.isActive }).where(eq(products.id, id));
    return res.json({ success: true });
  });

  router.delete("/:id", requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    await db.delete(products).where(eq(products.id, id));
    return res.json({ success: true });
  });

  app.use("/api/admin/products", router);
}
