import { AdminLayout } from "@/features/admin/presentation/components/AdminLayout";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminActivityLogs, useAdminSettings, useUpdateAdminSettings } from "@/features/admin/application/settings/useAdminSettings";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const settings = useAdminSettings();
  const update = useUpdateAdminSettings();
  const activity = useAdminActivityLogs({ page: 1, pageSize: 20 });

  const [businessName, setBusinessName] = useState("");
  const [nit, setNit] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");
  const [shippingCosts, setShippingCosts] = useState("");
  const [autoMessages, setAutoMessages] = useState("");

  useEffect(() => {
    if (!settings.data?.settings) return;
    const s = settings.data.settings;
    setBusinessName(s.businessName || "");
    setNit(s.nit || "");
    setAddress(s.address || "");
    setPhone(s.phone || "");
    setSocialLinks(s.socialLinks ? JSON.stringify(s.socialLinks, null, 2) : "");
    setPaymentMethods(s.paymentMethods ? JSON.stringify(s.paymentMethods, null, 2) : "");
    setShippingCosts(s.shippingCosts ? JSON.stringify(s.shippingCosts, null, 2) : "");
    setAutoMessages(s.autoMessages ? JSON.stringify(s.autoMessages, null, 2) : "");
  }, [settings.data]);

  const parseJsonOrNull = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed);
  };

  const onSave = async () => {
    try {
      const body = {
        businessName,
        nit: nit.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        socialLinks: parseJsonOrNull(socialLinks),
        paymentMethods: parseJsonOrNull(paymentMethods),
        shippingCosts: parseJsonOrNull(shippingCosts),
        autoMessages: parseJsonOrNull(autoMessages),
      };
      await update.mutateAsync(body);
      toast({ title: "Configuración guardada" });
    } catch (err) {
      toast({
        title: "No se pudo guardar",
        description: err instanceof Error ? err.message : "Revisa los campos e intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Información del negocio, pagos, envíos y mensajes automáticos.
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="business">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="business">Negocio</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="shipping">Envíos</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Datos del negocio</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Nombre</div>
                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">NIT</div>
                    <Input value={nit} onChange={(e) => setNit(e.target.value)} />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <div className="text-sm font-medium">Dirección</div>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Teléfono</div>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="text-sm font-medium">Redes sociales (JSON)</div>
                  <Textarea value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} placeholder='{"instagram":"...","facebook":"..."}' />
                </div>
                <div className="flex justify-end">
                  <Button onClick={onSave} disabled={update.isPending}>
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de pago (JSON)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Textarea value={paymentMethods} onChange={(e) => setPaymentMethods(e.target.value)} placeholder='{"cash":true,"transfer":true,"card":false}' />
                <div className="flex justify-end">
                  <Button onClick={onSave} disabled={update.isPending}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle>Costos de envío por zona (JSON)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Textarea value={shippingCosts} onChange={(e) => setShippingCosts(e.target.value)} placeholder='{"zona1":8000,"zona2":12000}' />
                <div className="flex justify-end">
                  <Button onClick={onSave} disabled={update.isPending}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes automáticos (JSON)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Textarea value={autoMessages} onChange={(e) => setAutoMessages(e.target.value)} placeholder='{"order_confirmed":"...","order_shipped":"..."}' />
                <div className="flex justify-end">
                  <Button onClick={onSave} disabled={update.isPending}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Logs de actividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activity.data?.items?.length ? (
                        activity.data.items.map((a: any) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{a.action}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{a.ip || "—"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                            Sin actividad.
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
