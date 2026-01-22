import { AdminLayout } from "@/features/admin/presentation/components/AdminLayout";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminInventoryExpiring,
  useAdminInventoryMovements,
  useAdminInventoryOverview,
  useAdminWarehouses,
  useCreateInventoryMovement,
} from "@/features/admin/application/inventory/useAdminInventory";

export default function AdminInventoryPage() {
  const { toast } = useToast();
  const [warehouseId, setWarehouseId] = useState<string>("all");
  const [q, setQ] = useState("");

  const warehousesQuery = useAdminWarehouses();
  const overviewQuery = useAdminInventoryOverview({
    warehouseId: warehouseId === "all" ? undefined : Number(warehouseId),
    q: q.trim() || undefined,
  });
  const movementsQuery = useAdminInventoryMovements({
    warehouseId: warehouseId === "all" ? undefined : Number(warehouseId),
    page: 1,
    pageSize: 20,
  });
  const expiringQuery = useAdminInventoryExpiring({ days: 30 });
  const createMovement = useCreateInventoryMovement();

  const [movementType, setMovementType] = useState<"in" | "out" | "adjust">("in");
  const [movementProductId, setMovementProductId] = useState<string>("none");
  const [movementQty, setMovementQty] = useState<string>("0");
  const [movementNotes, setMovementNotes] = useState<string>("");

  const productsForSelect = useMemo(() => {
    const items = overviewQuery.data?.items ?? [];
    return items.slice(0, 200);
  }, [overviewQuery.data]);

  const onCreateMovement = async () => {
    const wid = warehouseId === "all" ? warehousesQuery.data?.items?.[0]?.id : Number(warehouseId);
    if (!wid) {
      toast({ title: "Selecciona una bodega", variant: "destructive" });
      return;
    }
    const pid = Number(movementProductId);
    if (!Number.isFinite(pid) || pid <= 0) {
      toast({ title: "Selecciona un producto", variant: "destructive" });
      return;
    }
    const qty = Number(movementQty);
    if (!Number.isFinite(qty) || qty < 0) {
      toast({ title: "Cantidad inválida", variant: "destructive" });
      return;
    }
    try {
      await createMovement.mutateAsync({
        body: {
          productId: pid,
          warehouseId: wid,
          type: movementType,
          quantity: Math.trunc(qty),
          notes: movementNotes.trim() ? movementNotes.trim() : null,
        },
      });
      toast({ title: "Movimiento registrado" });
      setMovementQty("0");
      setMovementNotes("");
      movementsQuery.refetch();
      overviewQuery.refetch();
    } catch (err) {
      toast({
        title: "No se pudo registrar",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Inventario</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Control de stock, alertas y movimientos.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a href="/api/admin/inventory/export.csv" target="_blank" rel="noreferrer">
                  Exportar CSV
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar (nombre / SKU / código de barras)..." />
            </div>
            <div className="md:col-span-3">
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Bodega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {warehousesQuery.data?.items?.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Stock</TabsTrigger>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
            <TabsTrigger value="expiring">Próximos a vencer</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Stock y alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Mínimo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overviewQuery.data?.items?.length ? (
                        overviewQuery.data.items.map((it) => {
                          const low = it.quantity <= it.stockMin;
                          return (
                            <TableRow key={it.productId}>
                              <TableCell className="font-medium">{it.name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{it.sku || "—"}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{it.barcode || "—"}</TableCell>
                              <TableCell className={"text-right " + (low ? "font-bold text-destructive" : "")}>
                                {it.quantity}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">{it.stockMin}</TableCell>
                              <TableCell>
                                {low ? <Badge variant="destructive">Bajo</Badge> : <Badge className="bg-primary text-primary-foreground">OK</Badge>}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                            Sin datos.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Registrar movimiento</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Tipo</div>
                    <Select value={movementType} onValueChange={(v) => setMovementType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Entrada</SelectItem>
                        <SelectItem value="out">Salida</SelectItem>
                        <SelectItem value="adjust">Ajuste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Producto</div>
                    <Select value={movementProductId} onValueChange={setMovementProductId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Selecciona</SelectItem>
                        {productsForSelect.map((p) => (
                          <SelectItem key={p.productId} value={String(p.productId)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Cantidad</div>
                    <Input value={movementQty} onChange={(e) => setMovementQty(e.target.value)} />
                  </div>

                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Notas</div>
                    <Input value={movementNotes} onChange={(e) => setMovementNotes(e.target.value)} placeholder="Opcional" />
                  </div>

                  <Button onClick={onCreateMovement} disabled={createMovement.isPending}>
                    Guardar movimiento
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Fecha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead>Notas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movementsQuery.data?.items?.length ? (
                          movementsQuery.data.items.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(m.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="font-medium">{m.type}</TableCell>
                              <TableCell className="text-right">{m.quantity}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{m.notes || "—"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                              Sin movimientos.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expiring">
            <Card>
              <CardHeader>
                <CardTitle>Productos próximos a vencer (30 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Vence</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringQuery.data?.items?.length ? (
                        expiringQuery.data.items.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{p.sku || "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-right">{p.stock}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                            Sin productos próximos a vencer.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
