import { eq } from "drizzle-orm";
import { db } from "../../../../db.js";
import { customers } from "../../../../../shared/schema.js";
import type { CustomerRecord, CustomerRepository } from "../../domain/ports/CustomerRepository.js";

export class DrizzleCustomerRepository implements CustomerRepository {
  async findByPhone(phone: string): Promise<CustomerRecord | null> {
    const rows = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return { id: row.id, name: row.name, email: row.email ?? null, phone: row.phone ?? null };
  }

  async findByEmail(email: string): Promise<CustomerRecord | null> {
    const rows = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return { id: row.id, name: row.name, email: row.email ?? null, phone: row.phone ?? null };
  }

  async create(input: { name: string; phone: string | null; email: string | null }): Promise<CustomerRecord> {
    const [row] = await db
      .insert(customers)
      .values({
        name: input.name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        segment: null,
        communicationPreferences: null,
        isActive: true,
      })
      .returning();

    return { id: row.id, name: row.name, email: row.email ?? null, phone: row.phone ?? null };
  }

  async updateName(id: number, name: string): Promise<void> {
    await db.update(customers).set({ name }).where(eq(customers.id, id));
  }
}

