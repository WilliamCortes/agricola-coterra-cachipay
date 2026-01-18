import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { categories, products, testimonials } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.categories.list.path, async (req, res) => {
    const result = await storage.getCategories();
    res.json(result);
  });

  app.get(api.categories.get.path, async (req, res) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
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
    const category = await storage.getCategoryBySlug(req.params.slug);
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

  await seedDatabase();

  return httpServer;
}

export async function seedDatabase() {
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length === 0) {
    const cats = await db.insert(categories).values([
      { name: "Alimentos para Animales", slug: "alimentos", description: "Nutrición balanceada para ganado y mascotas." },
      { name: "Mascotas", slug: "mascotas", description: "Todo para el cuidado y bienestar de tus mascotas." },
      { name: "Insumos Agrícolas", slug: "insumos", description: "Fertilizantes, semillas y control de plagas." },
      { name: "Herramientas", slug: "herramientas", description: "Equipos duraderos para el trabajo de campo." },
    ]).returning();

    await db.insert(products).values([
      { categoryId: cats[0].id, name: "Concentrado Ganado Lechero", description: "Alimento de alta energía para vacas lecheras.", price: 85000 },
      { categoryId: cats[0].id, name: "Maíz Amarillo Partido", description: "Saco de 40kg, ideal para aves de corral.", price: 65000 },
      { categoryId: cats[1].id, name: "Comida para Perros Adultos", description: "Nutrición completa, sabor carne.", price: 45000 },
      { categoryId: cats[2].id, name: "Fertilizante Triple 15", description: "Saco 50kg, ideal para todo tipo de cultivo.", price: 120000 },
      { categoryId: cats[3].id, name: "Machete Colima", description: "Acero de alta calidad, incluye funda.", price: 25000 },
    ]);

    await db.insert(testimonials).values([
      { name: "Don Pedro", role: "Agricultor Local", content: "Los insumos de Agrícola Coterra mejoraron mi cosecha de café notablemente." },
      { name: "María González", role: "Ganadera", content: "Excelente atención y productos de calidad para mis animales. Muy recomendado." },
    ]);
  }
}
