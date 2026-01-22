import { AdminLayout } from "@/features/admin/presentation/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const salesData = [
  { day: "Lun", total: 120000 },
  { day: "Mar", total: 180000 },
  { day: "Mié", total: 160000 },
  { day: "Jue", total: 220000 },
  { day: "Vie", total: 260000 },
  { day: "Sáb", total: 300000 },
  { day: "Dom", total: 240000 },
];

export default function AdminOverviewPage() {
  return (
    <AdminLayout>
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Ventas del día
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">$0</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Pedidos pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">0</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Stock bajo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">0</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Clientes nuevos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">0</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia de ventas (últimos 7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                total: { label: "Ventas", color: "hsl(var(--primary))" },
              }}
              className="h-[260px]"
            >
              <AreaChart data={salesData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="total"
                  type="monotone"
                  fill="var(--color-total)"
                  fillOpacity={0.15}
                  stroke="var(--color-total)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

