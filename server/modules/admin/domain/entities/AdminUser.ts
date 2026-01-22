export type AdminUserRole = "admin" | "manager" | "staff";

export type AdminUser = {
  id: number;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
};

