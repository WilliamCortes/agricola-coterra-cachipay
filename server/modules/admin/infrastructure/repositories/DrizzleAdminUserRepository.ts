import { db } from "../../../../db";
import { adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { AdminUserRepository, AdminUserWithPassword } from "../../domain/ports/AdminUserRepository";

export class DrizzleAdminUserRepository implements AdminUserRepository {
  async findByEmail(email: string): Promise<AdminUserWithPassword | null> {
    const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      role: row.role as any,
      isActive: row.isActive,
      passwordHash: row.passwordHash,
    };
  }

  async findById(id: number) {
    const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return { id: row.id, email: row.email, role: row.role as any, isActive: row.isActive };
  }

  async updatePasswordHash(adminUserId: number, passwordHash: string): Promise<void> {
    await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, adminUserId));
  }
}
