import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type AdminProductListItem = {
  id: number;
  name: string;
  sku: string | null;
  categoryId: number | null;
  price: number;
  promoPrice: number | null;
  stock: number;
  stockMin: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string | Date;
};

export type AdminProductsQueryInput = {
  q?: string;
  categoryId?: number;
  isActive?: boolean;
  sortBy?: "name" | "price" | "stock" | "createdAt" | "isActive";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

type ListResponse = {
  items: AdminProductListItem[];
  page: number;
  pageSize: number;
  total: number;
};

type ProductDetailResponse = {
  product: any;
  images: { id: number; url: string; sortOrder: number }[];
};

function buildQueryString(input: AdminProductsQueryInput) {
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (typeof input.categoryId === "number") params.set("categoryId", String(input.categoryId));
  if (typeof input.isActive === "boolean") params.set("isActive", String(input.isActive));
  if (input.sortBy) params.set("sortBy", input.sortBy);
  if (input.sortDir) params.set("sortDir", input.sortDir);
  if (input.page) params.set("page", String(input.page));
  if (input.pageSize) params.set("pageSize", String(input.pageSize));
  return params.toString();
}

export function useAdminProducts(input: AdminProductsQueryInput) {
  return useQuery<ListResponse>({
    queryKey: ["admin-products", input],
    queryFn: async () => {
      const qs = buildQueryString(input);
      const res = await apiRequest("GET", `/api/admin/products?${qs}`);
      return (await res.json()) as ListResponse;
    },
  });
}

export function useAdminProduct(productId: number) {
  return useQuery<ProductDetailResponse>({
    queryKey: ["admin-product", productId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/products/${productId}`);
      return (await res.json()) as ProductDetailResponse;
    },
    enabled: Number.isFinite(productId) && productId > 0,
  });
}

export function useCreateAdminProduct() {
  return useMutation({
    mutationFn: async (input: { body: any }) => {
      const res = await apiRequest("POST", "/api/admin/products", input.body);
      return (await res.json()) as { id: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useUpdateAdminProduct() {
  return useMutation({
    mutationFn: async (input: { productId: number; body: any }) => {
      const res = await apiRequest("PUT", `/api/admin/products/${input.productId}`, input.body);
      return (await res.json()) as { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", variables.productId] });
    },
  });
}

export function useDeleteAdminProduct() {
  return useMutation({
    mutationFn: async (input: { id: number; queryInput: AdminProductsQueryInput }) => {
      const res = await apiRequest("DELETE", `/api/admin/products/${input.id}`);
      return (await res.json()) as { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products", variables.queryInput] });
    },
  });
}

export function useDuplicateAdminProduct() {
  return useMutation({
    mutationFn: async (input: { id: number; queryInput: AdminProductsQueryInput }) => {
      const res = await apiRequest("POST", `/api/admin/products/${input.id}/duplicate`);
      return (await res.json()) as { id: number };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products", variables.queryInput] });
    },
  });
}

export function useToggleAdminProductActive() {
  return useMutation({
    mutationFn: async (input: { id: number; queryInput: AdminProductsQueryInput }) => {
      const res = await apiRequest("POST", `/api/admin/products/${input.id}/toggle-active`);
      return (await res.json()) as { success: true };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products", variables.queryInput] });
    },
  });
}
