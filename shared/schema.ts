import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Stored in cents/smallest unit
  imageUrl: text("image_url"),
  stock: integer("stock").default(100),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // e.g., "Agricultor Local"
  content: text("content").notNull(),
  rating: integer("rating").default(5),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Message = typeof messages.$inferSelect;
