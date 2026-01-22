import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";
import { Link } from "wouter";
import { useAdminLogin } from "@/features/admin/application/useAdminSession";
import { useLocation } from "wouter";
import { useAdminSession } from "@/features/admin/application/useAdminSession";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { toast } = useToast();
  const login = useAdminLogin();
  const [, setLocation] = useLocation();
  const session = useAdminSession();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  React.useEffect(() => {
    if (session.data?.user) {
      setLocation("/admin");
    }
  }, [session.data, setLocation]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      setLocation("/admin");
    } catch (err) {
      toast({
        title: "No se pudo iniciar sesión",
        description: err instanceof Error ? err.message : "Credenciales inválidas.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-primary/95 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-border/60 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white p-2 shadow-sm ring-4 ring-primary/10">
            <img
              src={logoImg}
              alt="Agrícola Coterra Logo"
              className="h-full w-full rounded-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-primary">Panel Administrativo</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Acceso restringido a personal autorizado.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@coterra.com"
                {...form.register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.register("password")}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.watch("rememberMe")}
                  onCheckedChange={(checked) =>
                    form.setValue("rememberMe", Boolean(checked))
                  }
                />
                <span>Recordarme</span>
              </label>
              <Link
                href="/admin/forgot-password"
                className="font-medium text-secondary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90"
              disabled={login.isPending}
            >
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
