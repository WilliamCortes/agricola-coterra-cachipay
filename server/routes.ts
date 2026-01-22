import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import {
  categories,
  legacyCategories,
  legacyProducts,
  legacyTestimonials,
  products,
  stockLevels,
  testimonials,
  warehouses,
} from "@shared/schema";
import { registerAdminAuthRoutes } from "./modules/admin/presentation/adminAuthRoutes";
import { registerAdminProductRoutes } from "./modules/admin/presentation/adminProductRoutes";
import { registerAdminInventoryRoutes } from "./modules/admin/presentation/adminInventoryRoutes";
import { registerAdminOrderRoutes } from "./modules/admin/presentation/adminOrderRoutes";
import { registerAdminCustomerRoutes } from "./modules/admin/presentation/adminCustomerRoutes";
import { registerAdminReportRoutes } from "./modules/admin/presentation/adminReportRoutes";
import { registerAdminSettingsRoutes } from "./modules/admin/presentation/adminSettingsRoutes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  registerAdminAuthRoutes(app);
  registerAdminProductRoutes(app);
  registerAdminInventoryRoutes(app);
  registerAdminOrderRoutes(app);
  registerAdminCustomerRoutes(app);
  registerAdminReportRoutes(app);
  registerAdminSettingsRoutes(app);

  app.get(api.categories.list.path, async (req, res) => {
    const result = await storage.getCategories();
    res.json(result);
  });

  app.get(api.categories.get.path, async (req, res) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const category = await storage.getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  });

  app.get(api.products.list.path, async (req, res) => {
    const result = await storage.getProducts();
    res.json(result);
  });

  app.get(api.products.getByCategory.path, async (req, res) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const category = await storage.getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const result = await storage.getProductsByCategory(category.id);
    res.json(result);
  });

  app.get(api.testimonials.list.path, async (req, res) => {
    const result = await storage.getTestimonials();
    res.json(result);
  });

  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);
      await storage.createMessage(input);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  try {
    await seedDatabase();
  } catch (err) {
    console.error("Database seed skipped:", err);
  }

  return httpServer;
}

export async function seedDatabase() {
  const existingStoreCategories = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existingStoreCategories.length === 0) {
    const legacyCats = await db
      .select({
        id: legacyCategories.id,
        name: legacyCategories.name,
        slug: legacyCategories.slug,
        description: legacyCategories.description,
        imageUrl: legacyCategories.imageUrl,
      })
      .from(legacyCategories);

    const seedCats = legacyCats.length
      ? legacyCats
      : [
          {
            name: "Alimentos para Animales",
            slug: "alimentos",
            description: "Nutrición balanceada para ganado y mascotas.",
            imageUrl: null,
          },
          { name: "Mascotas", slug: "mascotas", description: "Todo para el cuidado y bienestar de tus mascotas.", imageUrl: null },
          { name: "Insumos Agrícolas", slug: "insumos", description: "Fertilizantes, semillas y control de plagas.", imageUrl: null },
          { name: "Herramientas", slug: "herramientas", description: "Equipos duraderos para el trabajo de campo.", imageUrl: null },
        ];

    const insertedCats = await db
      .insert(categories)
      .values(
        seedCats.map((c: any, idx: number) => ({
          name: c.name,
          slug: c.slug,
          description: c.description ?? null,
          imageUrl: c.imageUrl ?? null,
          parentId: null,
          sortOrder: idx,
        }))
      )
      .returning({ id: categories.id, slug: categories.slug });

    const slugToId = new Map(insertedCats.map((c) => [c.slug, c.id]));

    const legacyProds = await db
      .select({
        name: legacyProducts.name,
        description: legacyProducts.description,
        price: legacyProducts.price,
        imageUrl: legacyProducts.imageUrl,
        stock: legacyProducts.stock,
        categoryId: legacyProducts.categoryId,
      })
      .from(legacyProducts);

    if (legacyProds.length) {
      const legacyCatIdToSlug = new Map<number, string>();
      for (const c of legacyCats) {
        legacyCatIdToSlug.set(c.id, c.slug);
      }

      await db.insert(products).values(
        legacyProds.map((p) => ({
          categoryId: p.categoryId
            ? slugToId.get(legacyCatIdToSlug.get(p.categoryId) ?? "") ?? null
            : null,
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
          stock: p.stock,
          costPrice: 0,
          promoPrice: null,
          stockMin: 0,
          stockMax: null,
          unit: null,
          supplier: null,
          expiresAt: null,
          tags: [],
          isActive: true,
        }))
      );
    } else {
      const catIds = insertedCats.map((c) => c.id);
      await db.insert(products).values([
        { categoryId: catIds[0]!, name: "Concentrado Ganado Lechero", description: "Alimento de alta energía para vacas lecheras.", price: 85000, costPrice: 0, stockMin: 0, isActive: true },
        { categoryId: catIds[0]!, name: "Maíz Amarillo Partido", description: "Saco de 40kg, ideal para aves de corral.", price: 65000, costPrice: 0, stockMin: 0, isActive: true },
        { categoryId: catIds[1]!, name: "Comida para Perros Adultos", description: "Nutrición completa, sabor carne.", price: 45000, costPrice: 0, stockMin: 0, isActive: true },
        { categoryId: catIds[2]!, name: "Fertilizante Triple 15", description: "Saco 50kg, ideal para todo tipo de cultivo.", price: 120000, costPrice: 0, stockMin: 0, isActive: true },
        { categoryId: catIds[3]!, name: "Machete Colima", description: "Acero de alta calidad, incluye funda.", price: 25000, costPrice: 0, stockMin: 0, isActive: true },
      ]);
    }

    const existingStoreTestimonials = await db.select({ id: testimonials.id }).from(testimonials).limit(1);
    if (existingStoreTestimonials.length === 0) {
      const legacyTs = await db
        .select({
          name: legacyTestimonials.name,
          role: legacyTestimonials.role,
          content: legacyTestimonials.content,
          rating: legacyTestimonials.rating,
        })
        .from(legacyTestimonials);

      await db.insert(testimonials).values(
        (legacyTs.length
          ? legacyTs
          : [
              {
                name: "Don Pedro",
                role: "Agricultor Local",
                content: "Los insumos de Agrícola Coterra mejoraron mi cosecha de café notablemente.",
                rating: 5,
              },
              {
                name: "María González",
                role: "Ganadera",
                content: "Excelente atención y productos de calidad para mis animales. Muy recomendado.",
                rating: 5,
              },
            ]) as any
      );
    }
  }

  const existingWarehouses = await db.select().from(warehouses);
  if (existingWarehouses.length === 0) {
    const created = await db
      .insert(warehouses)
      .values({ name: "Bodega Principal", location: "Cachipay" })
      .returning({ id: warehouses.id });
    const warehouseId = created[0]!.id;

    const allProducts = await db.select({ id: products.id, stock: products.stock }).from(products);
    if (allProducts.length) {
      await db.insert(stockLevels).values(
        allProducts.map((p) => ({
          productId: p.id,
          warehouseId,
          quantity: p.stock ?? 0,
        }))
      );
    }
  }
}
