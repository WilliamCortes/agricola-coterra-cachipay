import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useAdminSettings() {
  return useQuery<any>({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/settings");
      return (await res.json()) as any;
    },
  });
}

export function useUpdateAdminSettings() {
  return useMutation({
    mutationFn: async (body: any) => {
      const res = await apiRequest("PUT", "/api/admin/settings", body);
      return (await res.json()) as any;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-settings"], data);
    },
  });
}

export function useAdminActivityLogs(input: { page: number; pageSize: number }) {
  return useQuery<any>({
    queryKey: ["admin-activity", input],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(input.page));
      params.set("pageSize", String(input.pageSize));
      const res = await apiRequest("GET", `/api/admin/settings/activity?${params.toString()}`);
      return (await res.json()) as any;
    },
  });
}

