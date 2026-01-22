import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAdminSalesReport(period: "day" | "week" | "month") {
  return useQuery<any>({
    queryKey: ["admin-reports-sales", period],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/reports/sales?period=${period}`);
      return (await res.json()) as any;
    },
  });
}

export function useAdminTopProducts(limit: number) {
  return useQuery<any>({
    queryKey: ["admin-reports-top-products", limit],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/reports/top-products?limit=${limit}`);
      return (await res.json()) as any;
    },
  });
}

export function useAdminTopCustomers(limit: number) {
  return useQuery<any>({
    queryKey: ["admin-reports-top-customers", limit],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/reports/top-customers?limit=${limit}`);
      return (await res.json()) as any;
    },
  });
}

export function useAdminInventoryValue() {
  return useQuery<any>({
    queryKey: ["admin-reports-inventory-value"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/reports/inventory-value");
      return (await res.json()) as any;
    },
  });
}

export function useAdminMarginByProduct(limit: number) {
  return useQuery<any>({
    queryKey: ["admin-reports-margin", limit],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/reports/margin-by-product?limit=${limit}`);
      return (await res.json()) as any;
    },
  });
}

