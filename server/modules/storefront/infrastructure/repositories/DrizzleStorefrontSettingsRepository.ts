import { asc } from "drizzle-orm";
import { db } from "../../../../db.js";
import { businessSettings } from "../../../../../shared/schema.js";
import type { StorefrontSettings, StorefrontSettingsRepository } from "../../domain/ports/StorefrontSettingsRepository.js";

export class DrizzleStorefrontSettingsRepository implements StorefrontSettingsRepository {
  async get(): Promise<StorefrontSettings> {
    const rows = await db.select().from(businessSettings).orderBy(asc(businessSettings.id)).limit(1);
    const row = rows[0];
    if (row) {
      return {
        businessName: row.businessName,
        phone: row.phone ?? null,
        address: row.address ?? null,
        shippingCosts: row.shippingCosts ?? null,
        paymentMethods: row.paymentMethods ?? null,
      };
    }

    const inserted = await db
      .insert(businessSettings)
      .values({
        businessName: "Agrícola Coterra",
        nit: null,
        address: null,
        phone: null,
        socialLinks: null,
        paymentMethods: null,
        shippingCosts: null,
        autoMessages: null,
      })
      .returning();

    return {
      businessName: inserted[0].businessName,
      phone: inserted[0].phone ?? null,
      address: inserted[0].address ?? null,
      shippingCosts: inserted[0].shippingCosts ?? null,
      paymentMethods: inserted[0].paymentMethods ?? null,
    };
  }
}

