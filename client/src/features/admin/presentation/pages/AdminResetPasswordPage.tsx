import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";

const schema = z.object({
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

function getTokenFromQueryString() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token") || "";
}

export default function AdminResetPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const token = getTokenFromQueryString();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await apiRequest("POST", "/api/admin/auth/reset-password", { token, password: values.password });
      toast({ title: "Contraseña actualizada", description: "Ya puedes iniciar sesión." });
      setLocation("/admin/login");
    } catch (err) {
      toast({
        title: "No se pudo restablecer",
        description: err instanceof Error ? err.message : "Token inválido o expirado.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-primary/95 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-border/60 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Restablecer contraseña</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Define una nueva contraseña para el panel admin.
          </p>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="space-y-4 text-sm">
              <p className="text-destructive font-medium">Falta el token en la URL.</p>
              <Link href="/admin/forgot-password" className="text-secondary hover:underline">
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
              </div>
              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
                Actualizar contraseña
              </Button>
              <div className="text-center text-sm">
                <Link href="/admin/login" className="text-secondary hover:underline">
                  Volver al login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

