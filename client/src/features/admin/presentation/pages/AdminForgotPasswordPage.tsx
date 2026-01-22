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
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminForgotPasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await apiRequest("POST", "/api/admin/auth/forgot-password", values);
      toast({
        title: "Revisa tu correo",
        description: "Si el correo existe, enviamos un enlace para restablecer la contraseña.",
      });
      setLocation("/admin/login");
    } catch (err) {
      toast({
        title: "No se pudo enviar el correo",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-primary/95 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-border/60 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Recuperar contraseña</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Te enviaremos un enlace para restablecerla.
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
            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
              Enviar enlace
            </Button>
            <div className="text-center text-sm">
              <Link href="/admin/login" className="text-secondary hover:underline">
                Volver al login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

