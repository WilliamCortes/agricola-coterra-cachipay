import type { AdminUser } from "../entities/AdminUser";

export type AdminUserWithPassword = AdminUser & { passwordHash: string };

export interface AdminUserRepository {
  findByEmail(email: string): Promise<AdminUserWithPassword | null>;
  findById(id: number): Promise<AdminUser | null>;
  updatePasswordHash(adminUserId: number, passwordHash: string): Promise<void>;
}
