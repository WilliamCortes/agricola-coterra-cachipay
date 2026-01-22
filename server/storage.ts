import { db } from "./db";
import {
  categories,
  products,
  testimonials,
  messages,
  type Category,
  type Product,
  type Testimonial,
  type Message,
  type InsertMessage
} from "@shared/schema";
import { eq } from "drizzle-orm";

function isDbSchemaError(err: unknown): boolean {
  const code = (err as any)?.code;
  return code === "42P01" || code === "42703" || code === "42501";
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isDbSchemaError(err)) return fallback;
    throw err;
  }
}

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getTestimonials(): Promise<Testimonial[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    const rows = await safe(
      () =>
        db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
      })
      .from(categories),
      [],
    );

    return rows.map((c) => ({
      ...c,
      parentId: null,
      sortOrder: 0,
    })) as Category[];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const rows = await safe(
      () =>
        db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
      })
      .from(categories)
      .where(eq(categories.slug, slug)),
      [],
    );

    const category = rows[0];
    if (!category) return undefined;
    return {
      ...category,
      parentId: null,
      sortOrder: 0,
    } as Category;
  }

  async getProducts(): Promise<Product[]> {
    const rows = await safe(
      () =>
        db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        stock: products.stock,
      })
      .from(products),
      [],
    );

    return rows.map((p) => ({
      ...p,
      sku: null,
      barcode: null,
      costPrice: 0,
      promoPrice: null,
      stockMin: 0,
      stockMax: null,
      unit: null,
      supplier: null,
      expiresAt: null,
      tags: null,
      isActive: true,
      createdAt: new Date(),
    })) as Product[];
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const rows = await safe(
      () =>
        db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        stock: products.stock,
      })
      .from(products)
      .where(eq(products.categoryId, categoryId)),
      [],
    );

    return rows.map((p) => ({
      ...p,
      sku: null,
      barcode: null,
      costPrice: 0,
      promoPrice: null,
      stockMin: 0,
      stockMax: null,
      unit: null,
      supplier: null,
      expiresAt: null,
      tags: null,
      isActive: true,
      createdAt: new Date(),
    })) as Product[];
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return await safe(() => db.select().from(testimonials), []);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      const [newMessage] = await db.insert(messages).values(message).returning();
      return newMessage;
    } catch (err) {
      if (isDbSchemaError(err)) {
        const e = new Error("Database is not ready. Run migrations and try again.");
        (e as any).status = 503;
        throw e;
      }
      throw err;
    }
  }
}

export const storage = new DatabaseStorage();
