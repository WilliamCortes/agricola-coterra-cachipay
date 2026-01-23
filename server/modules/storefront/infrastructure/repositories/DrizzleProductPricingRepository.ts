import { inArray } from "drizzle-orm";
import { db } from "../../../../db.js";
import { products } from "../../../../../shared/schema.js";
import type { ProductPricing, ProductPricingRepository } from "../../domain/ports/ProductPricingRepository.js";

export class DrizzleProductPricingRepository implements ProductPricingRepository {
  async findByIds(ids: number[]): Promise<ProductPricing[]> {
    if (ids.length === 0) return [];

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        promoPrice: products.promoPrice,
        isActive: products.isActive,
      })
      .from(products)
      .where(inArray(products.id, ids));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      promoPrice: r.promoPrice ?? null,
      isActive: r.isActive,
    }));
  }
}

