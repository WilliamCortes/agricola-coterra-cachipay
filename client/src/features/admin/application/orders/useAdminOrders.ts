import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useAdminOrdersKanban(input: { q?: string }) {
  return useQuery<{ items: any[] }>({
    queryKey: ["admin-orders-kanban", input],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (input.q) params.set("q", input.q);
      const qs = params.toString();
      const res = await apiRequest("GET", `/api/admin/orders/kanban${qs ? `?${qs}` : ""}`);
      return (await res.json()) as { items: any[] };
    },
  });
}

export function useAdminOrderDetail(orderId: number) {
  return useQuery<any>({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/orders/${orderId}`);
      return (await res.json()) as any;
    },
    enabled: Number.isFinite(orderId) && orderId > 0,
  });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async (input: { orderId: number; status: string; note: string | null }) => {
      const res = await apiRequest("POST", `/api/admin/orders/${input.orderId}/status`, { status: input.status, note: input.note });
      return (await res.json()) as { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-kanban"] });
    },
  });
}

export function useAssignOrderDelivery() {
  return useMutation({
    mutationFn: async (input: { orderId: number; assignedDelivery: string | null }) => {
      const res = await apiRequest("POST", `/api/admin/orders/${input.orderId}/assign-delivery`, { assignedDelivery: input.assignedDelivery });
      return (await res.json()) as { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-kanban"] });
    },
  });
}

export function useSetOrderShippingGuide() {
  return useMutation({
    mutationFn: async (input: { orderId: number; shippingGuideNumber: string | null }) => {
      const res = await apiRequest("POST", `/api/admin/orders/${input.orderId}/shipping-guide`, {
        shippingGuideNumber: input.shippingGuideNumber,
      });
      return (await res.json()) as { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-kanban"] });
    },
  });
}

export function useCreateOrderReturn() {
  return useMutation({
    mutationFn: async (input: { orderId: number; reason: string; amount: number }) => {
      const res = await apiRequest("POST", `/api/admin/orders/${input.orderId}/return`, { reason: input.reason, amount: input.amount });
      return (await res.json()) as { success: true };
    },
  });
}

export function useAdminOrderFinancialSummary(period: "day" | "week" | "month") {
  return useQuery<{ period: string; from: string; total: number; count: number }>({
    queryKey: ["admin-orders-summary", period],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/orders/summary/financial?period=${period}`);
      return (await res.json()) as any;
    },
  });
}
