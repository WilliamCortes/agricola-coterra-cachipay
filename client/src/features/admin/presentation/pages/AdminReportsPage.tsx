import { AdminLayout } from "@/features/admin/presentation/components/AdminLayout";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminInventoryValue, useAdminMarginByProduct, useAdminSalesReport, useAdminTopCustomers, useAdminTopProducts } from "@/features/admin/application/reports/useAdminReports";

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const sales = useAdminSalesReport(period);
  const topProducts = useAdminTopProducts(10);
  const topCustomers = useAdminTopCustomers(10);
  const inventoryValue = useAdminInventoryValue();
  const margin = useAdminMarginByProduct(10);

  const chartData = useMemo(() => {
    return (sales.data?.items ?? []).map((i: any) => ({
      bucket: new Date(i.bucket).toLocaleDateString(),
      total: i.total,
    }));
  }, [sales.data]);

  return (
    <AdminLayout>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Reportes</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Ventas, rentabilidad e inventario.</p>
            </div>
            <div className="flex items-center gap-2">
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
              <Button asChild variant="outline">
                <a href={`/api/admin/reports/sales.csv?period=${period}`} target="_blank" rel="noreferrer">
                  Exportar ventas CSV
                </a>
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Ventas (período)</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ${(((sales.data?.items ?? []).reduce((a: number, b: any) => a + (b.total ?? 0), 0)) / 100).toFixed(2)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Inventario valorizado (costo)</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ${((inventoryValue.data?.totalCost ?? 0) / 100).toFixed(2)}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ventas (tendencia)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ total: { label: "Ventas", color: "hsl(var(--primary))" } }} className="h-[220px]">
                <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="bucket" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Area dataKey="total" type="monotone" fill="var(--color-total)" fillOpacity={0.15} stroke="var(--color-total)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos más vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(topProducts.data?.items ?? []).map((p: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right">{p.quantity}</TableCell>
                        <TableCell className="text-right">${((p.revenue ?? 0) / 100).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes más rentables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(topCustomers.data?.items ?? []).map((c: any) => (
                      <TableRow key={c.customerId ?? c.name}>
                        <TableCell className="font-medium">{c.name || "—"}</TableCell>
                        <TableCell className="text-right">{c.count}</TableCell>
                        <TableCell className="text-right">${((c.total ?? 0) / 100).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Margen por producto (estimado)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Margen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(margin.data?.items ?? []).map((m: any) => (
                    <TableRow key={m.productId ?? m.name}>
                      <TableCell className="font-medium">{m.name || "—"}</TableCell>
                      <TableCell className="text-right">${((m.revenue ?? 0) / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-right">${((m.cost ?? 0) / 100).toFixed(2)}</TableCell>
                      <TableCell className={"text-right font-bold " + ((m.margin ?? 0) >= 0 ? "text-primary" : "text-destructive")}>
                        ${(((m.margin ?? 0) / 100)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
