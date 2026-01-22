import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/presentation/components/AdminSidebar";
import { AdminTopBar } from "@/features/admin/presentation/components/AdminTopBar";
import { useAdminSession } from "@/features/admin/application/useAdminSession";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const session = useAdminSession();

  React.useEffect(() => {
    if (session.isLoading) return;
    if (session.data === null) {
      setLocation("/admin/login");
    }
  }, [session.isLoading, session.data, setLocation]);

  if (session.isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="grid gap-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-[320px]" />
        </div>
      </div>
    );
  }

  if (session.data === null) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopBar />
        <div className="flex-1 overflow-auto bg-background p-4 sm:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
