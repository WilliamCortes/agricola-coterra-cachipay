import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";

export type AdminSessionUser = {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
};

type MeResponse = { user: AdminSessionUser };

export function useAdminSession() {
  return useQuery<MeResponse | null>({
    queryKey: ["/api/admin/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (input: { email: string; password: string; rememberMe: boolean }) => {
      const res = await apiRequest("POST", "/api/admin/auth/login", input);
      return (await res.json()) as MeResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/admin/auth/me"], data);
    },
  });
}

export function useAdminLogout() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/auth/logout");
      return (await res.json()) as { success: true };
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/auth/me"], null);
      queryClient.removeQueries({ queryKey: ["/api/admin/auth/me"] });
    },
  });
}

