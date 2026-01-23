import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { GetStorefrontSettingsUseCase } from "../application/GetStorefrontSettingsUseCase.js";
import { PlaceOrderUseCase } from "../application/PlaceOrderUseCase.js";
import { DrizzleCustomerRepository } from "../infrastructure/repositories/DrizzleCustomerRepository.js";
import { DrizzleOrderRepository } from "../infrastructure/repositories/DrizzleOrderRepository.js";
import { DrizzleProductPricingRepository } from "../infrastructure/repositories/DrizzleProductPricingRepository.js";
import { DrizzleStorefrontSettingsRepository } from "../infrastructure/repositories/DrizzleStorefrontSettingsRepository.js";

const placeOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2).max(200),
    phone: z.string().min(3).max(60),
    email: z.string().email().optional().nullable(),
  }),
  deliveryAddress: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(999),
      })
    )
    .min(1),
  shipping: z
    .object({
      cost: z.number().int().min(0),
      zone: z.string().min(1).max(120),
    })
    .optional()
    .nullable(),
});

export function registerStorefrontRoutes(app: Express) {
  const router = express.Router();

  const settingsUseCase = new GetStorefrontSettingsUseCase(new DrizzleStorefrontSettingsRepository());
  const placeOrderUseCase = new PlaceOrderUseCase(
    new DrizzleCustomerRepository(),
    new DrizzleProductPricingRepository(),
    new DrizzleOrderRepository()
  );

  router.get("/settings", async (_req, res) => {
    const settings = await settingsUseCase.execute();
    return res.json({ settings });
  });

  const handlePlaceOrder = async (req: any, res: any) => {
    try {
      const input = placeOrderSchema.parse(req.body);
      const placed = await placeOrderUseCase.execute({
        customer: { name: input.customer.name, phone: input.customer.phone, email: input.customer.email ?? null },
        deliveryAddress: input.deliveryAddress ?? null,
        notes: input.notes ?? null,
        items: input.items,
        shipping: input.shipping ? { cost: input.shipping.cost, zone: input.shipping.zone } : null,
      });
      return res.status(201).json({ orderId: placed.orderId, orderNumber: placed.orderNumber, total: placed.total, status: placed.status });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Invalid request" });
      }
      const status = (err as any)?.status;
      if (typeof status === "number") {
        return res.status(status).json({ message: (err as any)?.message ?? "Request failed" });
      }
      throw err;
    }
  };

  router.post("/orders", handlePlaceOrder);

  app.use("/api/storefront", router);
  app.post("/api/orders", handlePlaceOrder);
}
