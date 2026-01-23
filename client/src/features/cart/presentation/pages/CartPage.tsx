import { Link, useLocation } from "wouter";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "../CartProvider";
import { useCategories } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const PHONE_ALLOWED_CHARACTERS_REGEX = /^[0-9+()\-\s.]+$/;

const checkoutFormSchema = z.object({
  customerName: z.string().trim().min(2, "Nombre es requerido"),
  customerPhone: z
    .string()
    .trim()
    .min(1, "Teléfono es requerido")
    .refine((value) => PHONE_ALLOWED_CHARACTERS_REGEX.test(value), "Teléfono inválido")
    .refine((value) => (value.match(/\d/g) ?? []).length >= 7, "Teléfono inválido"),
  customerEmail: z
    .string()
    .trim()
    .email("Email inválido")
    .or(z.literal(""))
    .default(""),
  deliveryAddress: z.string().trim().min(5, "Dirección es requerida"),
  notes: z.string().trim().max(2000, "Notas demasiado largas").optional().or(z.literal("")).default(""),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const DEFAULT_SHIPPING_COST = 15_000;
const DEFAULT_SHIPPING_ZONE = "Cachipay";

export function CartPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { cart, itemsCount, subtotal, updateQuantity, removeItem, clear } = useCart();
  const { data: categories } = useCategories();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const checkoutForm = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onChange",
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryAddress: "",
      notes: "",
    },
  });

  const shippingCost = cart.items.length ? DEFAULT_SHIPPING_COST : 0;
  const total = subtotal + shippingCost;

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories ?? []) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

  const handleCheckout = async (values: CheckoutFormValues) => {
    if (!cart.items.length) return;

    setSubmitting(true);
    try {
      try {
        const res = await apiRequest("POST", "/api/orders", {
          customer: {
            name: values.customerName.trim(),
            phone: values.customerPhone.trim(),
            email: values.customerEmail.trim() ? values.customerEmail.trim() : null,
          },
          deliveryAddress: values.deliveryAddress.trim() ? values.deliveryAddress.trim() : null,
          notes: values.notes.trim() ? values.notes.trim() : null,
          items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shipping: {
            cost: shippingCost,
            zone: DEFAULT_SHIPPING_ZONE,
          },
        });

        const data = (await res.json()) as { orderNumber: string };
        clear();
        setCheckoutOpen(false);
        checkoutForm.reset();
        toast({
          title: "Pedido creado",
          description: `Tu pedido ${data.orderNumber} fue creado exitosamente.`,
        });
        setLocation("/products");
      } catch (err) {
        const serverMessage = extractServerMessage(err);
        if (serverMessage) {
          const mapped = mapServerMessageToField(serverMessage);
          if (mapped) {
            checkoutForm.setError(mapped.field, { type: "server", message: mapped.message });
          }

          toast({
            title: "No se pudo crear el pedido",
            description: mapped ? mapped.message : serverMessage,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "No se pudo crear el pedido",
          description: "Intenta nuevamente.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-muted/10">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-12 flex-1">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Carrito</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-end justify-between gap-6 border-b border-border/60 pb-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary">Carrito de Compras</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {itemsCount ? `${itemsCount} ítem(s) en tu carrito` : "Tu carrito está vacío"}
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button variant="outline" onClick={() => setLocation("/products")}>
              Seguir Comprando
            </Button>
            <Button variant="ghost" disabled={!cart.items.length} onClick={clear} className="text-destructive hover:text-destructive">
              Vaciar Carrito
            </Button>
          </div>
        </div>

        {!cart.items.length ? (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-secondary" />
                No tienes productos en el carrito
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-muted-foreground">Explora nuestros productos y agrega lo que necesites.</p>
              <Button onClick={() => setLocation("/products")}>Ver Productos</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <section className="w-full lg:w-3/4">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-center">Precio Unit.</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              <div className="divide-y divide-border/50">
                {cart.items.map((item) => {
                  const categoryName = item.categoryId ? categoryNameById.get(item.categoryId) : undefined;
                  const itemSubtotal = item.unitPrice * item.quantity;

                  return (
                    <div
                      key={item.productId}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 hover:bg-accent/10 rounded-xl px-2 transition-colors"
                    >
                      <div className="md:col-span-6 flex items-start sm:items-center gap-4">
                        <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-border/50 bg-white shadow-sm">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">
                              Sin imagen
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          {categoryName ? (
                            <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                              {categoryName}
                            </span>
                          ) : null}
                          <h3 className="font-display font-bold text-foreground text-lg leading-tight">{item.name}</h3>
                          <button
                            className="text-destructive hover:text-destructive/80 text-sm mt-3 hover:underline flex items-center gap-2 w-max transition-colors"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex md:justify-center items-center gap-2 md:gap-0">
                        <span className="md:hidden text-sm text-muted-foreground font-medium">Precio:</span>
                        <span className="font-medium text-foreground/90">{formatMoney(item.unitPrice)}</span>
                      </div>

                      <div className="md:col-span-2 flex md:justify-center items-center gap-2 md:gap-0">
                        <span className="md:hidden text-sm text-muted-foreground font-medium">Cantidad:</span>
                        <div className="flex items-center border border-border/60 rounded-lg bg-white overflow-hidden shadow-sm">
                          <button
                            className={cn(
                              "px-3 py-2 hover:bg-muted text-foreground/80 transition-colors",
                              item.quantity <= 1 && "opacity-50 pointer-events-none"
                            )}
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            className="px-3 py-2 hover:bg-muted text-foreground/80 transition-colors"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex md:justify-end items-center gap-2 md:gap-0">
                        <span className="md:hidden text-sm text-muted-foreground font-medium">Subtotal:</span>
                        <span className="font-bold text-foreground text-lg">{formatMoney(itemSubtotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 sm:hidden flex flex-col gap-3">
                <Button variant="outline" onClick={() => setLocation("/products")}>
                  Seguir Comprando
                </Button>
                <Button variant="ghost" onClick={clear} className="text-destructive hover:text-destructive">
                  Vaciar Carrito
                </Button>
              </div>
            </section>

            <aside className="w-full lg:w-1/4">
              <Card className="sticky top-28 border-border/50 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-display">Resumen de compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal ({itemsCount} ítem(s))</span>
                    <span className="font-medium text-foreground">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Envío</span>
                    <span className="font-medium text-foreground">{formatMoney(shippingCost)}</span>
                  </div>
                  <div className="border-t border-dashed border-border/60" />
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <div className="text-right">
                      <span className="block text-2xl font-bold text-secondary leading-none">{formatMoney(total)}</span>
                      <span className="text-xs text-muted-foreground">COP</span>
                    </div>
                  </div>

                  <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full font-semibold py-6" disabled={!cart.items.length}>
                        Proceder al Pago
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Finalizar pedido</DialogTitle>
                        <DialogDescription>Ingresa tus datos para crear el pedido.</DialogDescription>
                      </DialogHeader>

                      <Form {...checkoutForm}>
                        <form onSubmit={checkoutForm.handleSubmit(handleCheckout)} className="grid gap-4">
                          <FormField
                            control={checkoutForm.control}
                            name="customerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Tu nombre" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={checkoutForm.control}
                            name="customerPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Ej: +57 300 123 4567" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={checkoutForm.control}
                            name="customerEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (opcional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="tu@correo.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={checkoutForm.control}
                            name="deliveryAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Dirección de entrega" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={checkoutForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notas (opcional)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button type="submit" disabled={submitting || !checkoutForm.formState.isValid}>
                              {submitting ? "Creando..." : "Confirmar"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function extractServerMessage(err: unknown): string | null {
  const raw = err instanceof Error ? err.message : String(err);
  const jsonStart = raw.indexOf("{");
  if (jsonStart === -1) return null;
  const jsonText = raw.slice(jsonStart);
  try {
    const parsed = JSON.parse(jsonText) as { message?: unknown };
    const message = typeof parsed?.message === "string" ? parsed.message : null;
    return message ? message.trim() : null;
  } catch {
    return null;
  }
}

function mapServerMessageToField(
  message: string
): { field: keyof CheckoutFormValues; message: string } | null {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid email")) return { field: "customerEmail", message: "Email inválido" };
  if (normalized.includes("invalid phone")) return { field: "customerPhone", message: "Teléfono inválido" };
  if (normalized.includes("invalid request")) return null;
  return null;
}
