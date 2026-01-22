import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useAdminWarehouses() {
  return useQuery<{ items: any[] }>({
    queryKey: ["admin-warehouses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/inventory/warehouses");
      return (await res.json()) as { items: any[] };
    },
  });
}

export function useAdminInventoryOverview(input: { warehouseId?: number; q?: string }) {
  return useQuery<{ items: any[] }>({
    queryKey: ["admin-inventory-overview", input],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (input.q) params.set("q", input.q);
      if (typeof input.warehouseId === "number") params.set("warehouseId", String(input.warehouseId));
      const qs = params.toString();
      const res = await apiRequest("GET", `/api/admin/inventory/overview${qs ? `?${qs}` : ""}`);
      return (await res.json()) as { items: any[] };
    },
  });
}

export function useAdminInventoryMovements(input: { warehouseId?: number; productId?: number; type?: string; page: number; pageSize: number }) {
  return useQuery<{ items: any[]; page: number; pageSize: number; total: number }>({
    queryKey: ["admin-inventory-movements", input],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeof input.warehouseId === "number") params.set("warehouseId", String(input.warehouseId));
      if (typeof input.productId === "number") params.set("productId", String(input.productId));
      if (input.type) params.set("type", input.type);
      params.set("page", String(input.page));
      params.set("pageSize", String(input.pageSize));
      const res = await apiRequest("GET", `/api/admin/inventory/movements?${params.toString()}`);
      return (await res.json()) as any;
    },
  });
}

export function useCreateInventoryMovement() {
  return useMutation({
    mutationFn: async (input: { body: any }) => {
      const res = await apiRequest("POST", "/api/admin/inventory/movements", input.body);
      return (await res.json()) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory-movements"] });
    },
  });
}

export function useAdminInventoryExpiring(input: { days: number }) {
  return useQuery<{ items: any[] }>({
    queryKey: ["admin-inventory-expiring", input],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/inventory/expiring?days=${input.days}`);
      return (await res.json()) as { items: any[] };
    },
  });
}

