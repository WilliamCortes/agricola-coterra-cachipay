import { AdminLayout } from "@/features/admin/presentation/components/AdminLayout";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminOrdersKanban,
  useAdminOrderFinancialSummary,
  useAssignOrderDelivery,
  useCreateOrderReturn,
  useSetOrderShippingGuide,
  useUpdateOrderStatus,
} from "@/features/admin/application/orders/useAdminOrders";
import { MoreHorizontal, Printer, Send, Truck } from "lucide-react";

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const kanban = useAdminOrdersKanban({ q: q.trim() || undefined });
  const summary = useAdminOrderFinancialSummary(period);

  const grouped = useMemo(() => {
    const base = {
      pending: [] as any[],
      confirmed: [] as any[],
      preparing: [] as any[],
      shipped: [] as any[],
      delivered: [] as any[],
      canceled: [] as any[],
    };
    for (const item of kanban.data?.items ?? []) {
      const key = (item.status || "pending") as keyof typeof base;
      (base[key] ?? base.pending).push(item);
    }
    return base;
  }, [kanban.data]);

  return (
    <AdminLayout>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Pedidos</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Kanban por estado con acciones operativas.
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Diario</SelectItem>
                  <SelectItem value="week">Semanal</SelectItem>
                  <SelectItem value="month">Mensual</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden md:block text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">${((summary.data?.total ?? 0) / 100).toFixed(2)}</span> · Pedidos:{" "}
                <span className="font-semibold text-foreground">{summary.data?.count ?? 0}</span>
              </div>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por #pedido o cliente..." className="w-72" />
            </div>
          </CardHeader>
        </Card>

        <div className="flex gap-4 overflow-x-auto pb-2">
          <KanbanColumn title="Pendiente" status="pending" items={grouped.pending} />
          <KanbanColumn title="Confirmado" status="confirmed" items={grouped.confirmed} />
          <KanbanColumn title="Preparando" status="preparing" items={grouped.preparing} />
          <KanbanColumn title="Enviado" status="shipped" items={grouped.shipped} />
          <KanbanColumn title="Entregado" status="delivered" items={grouped.delivered} />
          <KanbanColumn title="Cancelado" status="canceled" items={grouped.canceled} />
        </div>
      </div>
    </AdminLayout>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmado";
    case "preparing":
      return "Preparando";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Entregado";
    case "canceled":
      return "Cancelado";
    default:
      return status;
  }
}

function KanbanColumn(props: { title: string; status: string; items: any[] }) {
  return (
    <div className="min-w-[320px] max-w-[320px] flex-1 rounded-xl border bg-muted/20">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 rounded-t-xl">
        <div className="font-semibold">{props.title}</div>
        <Badge variant="secondary">{props.items.length}</Badge>
      </div>
      <div className="grid gap-3 p-3">
        {props.items.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
        {!props.items.length ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Sin pedidos.</div>
        ) : null}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const { toast } = useToast();
  const updateStatus = useUpdateOrderStatus();
  const assignDelivery = useAssignOrderDelivery();
  const createReturn = useCreateOrderReturn();
  const setShippingGuide = useSetOrderShippingGuide();

  const onChangeStatus = async (next: string) => {
    const note = window.prompt("Nota (opcional):") || null;
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: next, note });
      toast({ title: "Estado actualizado", description: statusLabel(next) });
    } catch (err) {
      toast({ title: "No se pudo actualizar", description: err instanceof Error ? err.message : "Intenta de nuevo.", variant: "destructive" });
    }
  };

  const onAssign = async () => {
    const assignee = window.prompt("Asignar domicilio a:");
    if (assignee === null) return;
    try {
      await assignDelivery.mutateAsync({ orderId: order.id, assignedDelivery: assignee.trim() || null });
      toast({ title: "Domicilio actualizado" });
    } catch (err) {
      toast({ title: "No se pudo asignar", description: err instanceof Error ? err.message : "Intenta de nuevo.", variant: "destructive" });
    }
  };

  const onReturn = async () => {
    const reason = window.prompt("Motivo de devolución:");
    if (!reason) return;
    try {
      await createReturn.mutateAsync({ orderId: order.id, reason, amount: 0 });
      toast({ title: "Devolución registrada" });
    } catch (err) {
      toast({ title: "No se pudo registrar", description: err instanceof Error ? err.message : "Intenta de nuevo.", variant: "destructive" });
    }
  };

  const onSetShippingGuide = async () => {
    const value = window.prompt("Número de guía (opcional):");
    if (value === null) return;
    try {
      await setShippingGuide.mutateAsync({ orderId: order.id, shippingGuideNumber: value.trim() || null });
      toast({ title: "Guía actualizada" });
    } catch (err) {
      toast({ title: "No se pudo actualizar", description: err instanceof Error ? err.message : "Intenta de nuevo.", variant: "destructive" });
    }
  };

  const whatsappUrl = order.customerPhone
    ? `https://wa.me/${String(order.customerPhone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hola ${order.customerName || ""}, sobre tu pedido ${order.orderNumber}...`
      )}`
    : null;

  return (
    <Card className="border bg-background shadow-sm">
      <CardHeader className="py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-semibold">{order.orderNumber}</div>
            <div className="truncate text-sm text-muted-foreground">{order.customerName || "—"}</div>
            <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Acciones">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onChangeStatus("pending")}>Mover a Pendiente</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeStatus("confirmed")}>Mover a Confirmado</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeStatus("preparing")}>Mover a Preparando</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeStatus("shipped")}>Mover a Enviado</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeStatus("delivered")}>Mover a Entregado</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeStatus("canceled")}>Mover a Cancelado</DropdownMenuItem>
              <DropdownMenuItem onClick={onAssign}>
                <Truck className="mr-2 size-4" />
                Asignar domicilio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSetShippingGuide}>
                <Send className="mr-2 size-4" />
                Generar guía
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReturn}>
                <Send className="mr-2 size-4" />
                Procesar devolución
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/api/admin/orders/${order.id}/print`} target="_blank" rel="noreferrer">
                  <Printer className="mr-2 size-4" />
                  Imprimir
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="py-3 pt-0">
        <div className="flex items-center justify-between">
          <div className="font-bold text-secondary">${(order.total / 100).toFixed(2)}</div>
          {whatsappUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </Button>
          ) : (
            <Badge variant="secondary">Sin WhatsApp</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
