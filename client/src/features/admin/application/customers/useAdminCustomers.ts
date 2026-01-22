import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type AdminCustomersQueryInput = {
  q?: string;
  segment?: "frequent" | "wholesale" | "occasional";
  isActive?: boolean;
  page: number;
  pageSize: number;
};

export function useAdminCustomers(input: AdminCustomersQueryInput) {
  return useQuery<{ items: any[]; page: number; pageSize: number; total: number }>({
    queryKey: ["admin-customers", input],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (input.q) params.set("q", input.q);
      if (input.segment) params.set("segment", input.segment);
      if (typeof input.isActive === "boolean") params.set("isActive", String(input.isActive));
      params.set("page", String(input.page));
      params.set("pageSize", String(input.pageSize));
      const res = await apiRequest("GET", `/api/admin/customers?${params.toString()}`);
      return (await res.json()) as any;
    },
  });
}

export function useAdminCustomerDetail(customerId: number) {
  return useQuery<any>({
    queryKey: ["admin-customer", customerId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/customers/${customerId}`);
      return (await res.json()) as any;
    },
    enabled: Number.isFinite(customerId) && customerId > 0,
  });
}

export function useToggleCustomerActive() {
  return useMutation({
    mutationFn: async (input: { customerId: number; queryInput: AdminCustomersQueryInput }) => {
      const res = await apiRequest("POST", `/api/admin/customers/${input.customerId}/toggle-active`);
      return (await res.json()) as { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers", variables.queryInput] });
      queryClient.invalidateQueries({ queryKey: ["admin-customer", variables.customerId] });
    },
  });
}

export function useCreateCustomerNote() {
  return useMutation({
    mutationFn: async (input: { customerId: number; note: string }) => {
      const res = await apiRequest("POST", `/api/admin/customers/${input.customerId}/notes`, { note: input.note });
      return (await res.json()) as { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-customer", variables.customerId] });
    },
  });
}

export function useCreateCustomerInteraction() {
  return useMutation({
    mutationFn: async (input: { customerId: number; type: string; note: string | null }) => {
      const res = await apiRequest("POST", `/api/admin/customers/${input.customerId}/interactions`, { type: input.type, note: input.note });
      return (await res.json()) as { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-customer", variables.customerId] });
    },
  });
}

