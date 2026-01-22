import { Link, useLocation } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminSession } from "@/features/admin/application/useAdminSession";

const breadcrumbLabels: Record<string, string> = {
  "/admin": "Inicio",
  "/admin/productos": "Productos",
  "/admin/inventario": "Inventario",
  "/admin/pedidos": "Pedidos",
  "/admin/clientes": "Clientes",
  "/admin/categorias": "Categorías",
  "/admin/reportes": "Reportes",
  "/admin/configuracion": "Configuración",
};

function getBreadcrumb(location: string) {
  const exact = breadcrumbLabels[location];
  if (exact) return [{ href: "/admin", label: "Admin" }, { href: location, label: exact }];

  const matches = Object.keys(breadcrumbLabels)
    .filter((path) => path !== "/admin" && location.startsWith(path))
    .sort((a, b) => b.length - a.length);

  const best = matches[0];
  if (!best) return [{ href: "/admin", label: "Admin" }];
  return [{ href: "/admin", label: "Admin" }, { href: best, label: breadcrumbLabels[best] }];
}

export function AdminTopBar() {
  const [location] = useLocation();
  const crumbs = getBreadcrumb(location);
  const session = useAdminSession();
  const email = session.data?.user?.email || "Admin";

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <SidebarTrigger variant="ghost" className="shrink-0" />

        <nav className="hidden sm:flex items-center gap-2 text-sm">
          {crumbs.map((c, idx) => (
            <span key={c.href} className="flex items-center gap-2">
              <Link
                href={c.href}
                className={cn(
                  "hover:text-primary",
                  idx === crumbs.length - 1 ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {c.label}
              </Link>
              {idx !== crumbs.length - 1 ? (
                <span className="text-muted-foreground/60">/</span>
              ) : null}
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-lg border bg-muted/30 px-2">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="h-9 w-56 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notificaciones">
            <Bell className="size-5" />
          </Button>
          <div className="hidden sm:flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {email.slice(0, 1).toUpperCase()}
            </div>
            <div className="max-w-40 truncate text-sm font-medium">{email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
