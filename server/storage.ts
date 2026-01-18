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
  type InsertMessage // Added InsertMessage
} from "@shared/schema";
import { eq } from "drizzle-orm";

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
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
