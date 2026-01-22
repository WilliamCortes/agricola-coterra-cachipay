import { AdminLayout } from "@/features/admin/presentation/components/AdminLayout";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminCustomerDetail,
  useAdminCustomers,
  useCreateCustomerInteraction,
  useCreateCustomerNote,
  useToggleCustomerActive,
} from "@/features/admin/application/customers/useAdminCustomers";
import { MessageSquarePlus, Power, UserRound } from "lucide-react";

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [segment, setSegment] = useState<string>("all");
  const [isActive, setIsActive] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const queryInput = useMemo(() => {
    return {
      q: q.trim() || undefined,
      segment: segment === "all" ? undefined : (segment as any),
      isActive: isActive === "all" ? undefined : isActive === "true",
      page,
      pageSize,
    };
  }, [q, segment, isActive, page, pageSize]);

  const list = useAdminCustomers(queryInput);
  const toggleActive = useToggleCustomerActive();

  const totalPages = list.data ? Math.max(1, Math.ceil(list.data.total / list.data.pageSize)) : 1;

  const onToggle = async (id: number) => {
    try {
      await toggleActive.mutateAsync({ customerId: id, queryInput });
      toast({ title: "Estado actualizado" });
    } catch (err) {
      toast({ title: "No se pudo actualizar", description: err instanceof Error ? err.message : "Intenta de nuevo.", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Clientes</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Listado, segmentación e historial.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Buscar por nombre, email o teléfono..." />
            </div>
            <div className="md:col-span-3">
              <Select value={segment} onValueChange={(v) => { setSegment(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="occasional">Ocasional</SelectItem>
                  <SelectItem value="frequent">Frecuente</SelectItem>
                  <SelectItem value="wholesale">Mayorista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={isActive} onValueChange={(v) => { setIsActive(v); setPage(1); }}>
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
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Registros" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} / página</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data?.items?.length ? (
                  list.data.items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>{c.email || "—"}</div>
                        <div>{c.phone || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.segment}</Badge>
                        {!c.isActive ? <Badge variant="destructive" className="ml-2">Inactivo</Badge> : null}
                      </TableCell>
                      <TableCell className="text-right">{c.orderCount}</TableCell>
                      <TableCell className="text-right">${((c.totalSpent ?? 0) / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <CustomerDetailDialog customerId={c.id} />
                          <Button variant="ghost" size="icon" onClick={() => onToggle(c.id)} aria-label="Activar/Inactivar">
                            <Power className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Sin clientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">Página {page} de {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

function CustomerDetailDialog({ customerId }: { customerId: number }) {
  const { toast } = useToast();
  const detail = useAdminCustomerDetail(customerId);
  const createNote = useCreateCustomerNote();
  const createInteraction = useCreateCustomerInteraction();
  const [note, setNote] = useState("");
  const [interactionType, setInteractionType] = useState("Llamada");
  const [interactionNote, setInteractionNote] = useState("");

  const onAddNote = async () => {
    if (!note.trim()) return;
    try {
      await createNote.mutateAsync({ customerId, note: note.trim() });
      setNote("");
      detail.refetch();
      toast({ title: "Nota agregada" });
    } catch (err) {
      toast({ title: "No se pudo agregar", description: err instanceof Error ? err.message : "Intenta de nuevo.", variant: "destructive" });
    }
  };

  const onAddInteraction = async () => {
    if (!interactionType.trim()) return;
    try {
      await createInteraction.mutateAsync({ customerId, type: interactionType.trim(), note: interactionNote.trim() || null });
      setInteractionNote("");
      detail.refetch();
      toast({ title: "Interacción registrada" });
    } catch (err) {
      toast({ title: "No se pudo registrar", description: err instanceof Error ? err.message : "Intenta de nuevo.", variant: "destructive" });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserRound className="mr-2 size-4" />
          Ver
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalle de cliente</DialogTitle>
        </DialogHeader>
        {!detail.data ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <div className="grid gap-6">
            <div className="rounded-lg border p-4">
              <div className="text-lg font-bold">{detail.data.customer.name}</div>
              <div className="text-sm text-muted-foreground">{detail.data.customer.email || "—"} · {detail.data.customer.phone || "—"}</div>
              <div className="mt-2 flex gap-2 text-sm">
                <Badge variant="secondary">{detail.data.segment}</Badge>
                <Badge variant="outline">Pedidos: {detail.data.orderCount}</Badge>
                <Badge variant="outline">Total: ${((detail.data.totalSpent ?? 0) / 100).toFixed(2)}</Badge>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="mb-2 font-semibold">Notas internas</div>
                <div className="grid gap-2">
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Agregar nota..." />
                  <Button onClick={onAddNote} disabled={createNote.isPending}>
                    <MessageSquarePlus className="mr-2 size-4" />
                    Guardar nota
                  </Button>
                </div>
                <div className="mt-4 grid gap-2">
                  {detail.data.notes?.length ? detail.data.notes.map((n: any) => (
                    <div key={n.id} className="rounded border bg-muted/20 p-2 text-sm">
                      <div className="text-muted-foreground text-xs">{new Date(n.createdAt).toLocaleString()}</div>
                      <div>{n.note}</div>
                    </div>
                  )) : <div className="text-sm text-muted-foreground">Sin notas.</div>}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 font-semibold">Interacciones</div>
                <div className="grid gap-2">
                  <Input value={interactionType} onChange={(e) => setInteractionType(e.target.value)} placeholder="Tipo (Llamada, WhatsApp...)" />
                  <Input value={interactionNote} onChange={(e) => setInteractionNote(e.target.value)} placeholder="Nota (opcional)" />
                  <Button onClick={onAddInteraction} disabled={createInteraction.isPending}>
                    Registrar interacción
                  </Button>
                </div>
                <div className="mt-4 grid gap-2">
                  {detail.data.interactions?.length ? detail.data.interactions.map((i: any) => (
                    <div key={i.id} className="rounded border bg-muted/20 p-2 text-sm">
                      <div className="text-muted-foreground text-xs">{new Date(i.createdAt).toLocaleString()}</div>
                      <div className="font-medium">{i.type}</div>
                      <div>{i.note || "—"}</div>
                    </div>
                  )) : <div className="text-sm text-muted-foreground">Sin interacciones.</div>}
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 font-semibold">Pedidos recientes</div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>#</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.data.orders?.length ? detail.data.orders.map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.orderNumber}</TableCell>
                        <TableCell>{o.status}</TableCell>
                        <TableCell className="text-right">${((o.total ?? 0) / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">Sin pedidos.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

