import { AdminLayout } from "@/features/admin/presentation/components/AdminLayout";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-store";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminProducts,
  useDeleteAdminProduct,
  useDuplicateAdminProduct,
  useToggleAdminProductActive,
} from "@/features/admin/application/products/useAdminProducts";
import { ProductFormDialog } from "@/features/admin/presentation/components/products/ProductFormDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowUpDown, Copy, Pencil, Power, Trash2 } from "lucide-react";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [isActive, setIsActive] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "price" | "stock" | "isActive">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const queryInput = useMemo(() => {
    return {
      q: q.trim() || undefined,
      categoryId: categoryId === "all" ? undefined : Number(categoryId),
      isActive: isActive === "all" ? undefined : isActive === "true",
      sortBy,
      sortDir,
      page,
      pageSize,
    };
  }, [q, categoryId, isActive, sortBy, sortDir, page, pageSize]);

  const productsQuery = useAdminProducts(queryInput);
  const deleteMutation = useDeleteAdminProduct();
  const duplicateMutation = useDuplicateAdminProduct();
  const toggleMutation = useToggleAdminProductActive();

  const totalPages = productsQuery.data ? Math.max(1, Math.ceil(productsQuery.data.total / productsQuery.data.pageSize)) : 1;

  const onToggleSort = (next: typeof sortBy) => {
    if (sortBy === next) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
      return;
    }
    setSortBy(next);
    setSortDir("asc");
  };

  const onDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id, queryInput });
      toast({ title: "Producto eliminado" });
    } catch (err) {
      toast({
        title: "No se pudo eliminar",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const onDuplicate = async (id: number) => {
    try {
      await duplicateMutation.mutateAsync({ id, queryInput });
      toast({ title: "Producto duplicado" });
    } catch (err) {
      toast({
        title: "No se pudo duplicar",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const onToggleActive = async (id: number) => {
    try {
      await toggleMutation.mutateAsync({ id, queryInput });
      toast({ title: "Estado actualizado" });
    } catch (err) {
      toast({
        title: "No se pudo actualizar",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Productos</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra el catálogo: crea, edita, duplica y controla stock.
            </p>
          </div>
          <div className="flex gap-2">
            <ProductFormDialog mode="create" queryInput={queryInput} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nombre, SKU o descripción..."
              />
            </div>
            <div className="md:col-span-3">
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {loadingCategories ? null : categories?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select
                value={isActive}
                onValueChange={(v) => {
                  setIsActive(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Registros" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / página
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[45%]">
                    <button className="inline-flex items-center gap-1" onClick={() => onToggleSort("name")}>
                      Producto <ArrowUpDown className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[15%]">Categoría</TableHead>
                  <TableHead className="w-[12%]">
                    <button className="inline-flex items-center gap-1" onClick={() => onToggleSort("price")}>
                      Precio <ArrowUpDown className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[10%]">
                    <button className="inline-flex items-center gap-1" onClick={() => onToggleSort("stock")}>
                      Stock <ArrowUpDown className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[10%]">
                    <button className="inline-flex items-center gap-1" onClick={() => onToggleSort("isActive")}>
                      Estado <ArrowUpDown className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsQuery.isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : productsQuery.data?.items.length ? (
                  productsQuery.data.items.map((p) => {
                    const catName = categories?.find((c) => c.id === p.categoryId)?.name || "—";
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{p.name}</div>
                              <div className="truncate text-xs text-muted-foreground">
                                SKU: {p.sku || "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{catName}</TableCell>
                        <TableCell className="font-medium">${(p.price / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={p.stock <= p.stockMin ? "font-bold text-destructive" : ""}>
                              {p.stock}
                            </span>
                            {p.stock <= p.stockMin ? (
                              <Badge variant="destructive">Bajo</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          {p.isActive ? (
                            <Badge className="bg-primary text-primary-foreground">Activo</Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ProductFormDialog mode="edit" productId={p.id} queryInput={queryInput}>
                              <Button variant="ghost" size="icon" aria-label="Editar">
                                <Pencil className="size-4" />
                              </Button>
                            </ProductFormDialog>

                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Duplicar"
                              onClick={() => onDuplicate(p.id)}
                              disabled={duplicateMutation.isPending}
                            >
                              <Copy className="size-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Activar/Inactivar"
                              onClick={() => onToggleActive(p.id)}
                              disabled={toggleMutation.isPending}
                            >
                              <Power className="size-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Eliminar">
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará “{p.name}”.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(p.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={deleteMutation.isPending}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No hay productos para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
