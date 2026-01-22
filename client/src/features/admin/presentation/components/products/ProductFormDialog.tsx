import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-store";
import { Plus, ArrowUp, ArrowDown, X } from "lucide-react";
import {
  AdminProductsQueryInput,
  useAdminProduct,
  useCreateAdminProduct,
  useUpdateAdminProduct,
} from "@/features/admin/application/products/useAdminProducts";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  productId?: number;
  queryInput: AdminProductsQueryInput;
  children?: React.ReactNode;
};

type FormState = {
  name: string;
  description: string;
  categoryId: string;
  sku: string;
  price: string;
  costPrice: string;
  promoPrice: string;
  stock: string;
  stockMin: string;
  stockMax: string;
  unit: string;
  supplier: string;
  expiresAt: string;
  tags: string;
  isActive: boolean;
  imageUrls: string[];
};

function toFormState(input?: any, images?: { url: string }[]): FormState {
  return {
    name: input?.name ?? "",
    description: input?.description ?? "",
    categoryId: input?.categoryId ? String(input.categoryId) : "none",
    sku: input?.sku ?? "",
    price: String(input?.price ?? 0),
    costPrice: String(input?.costPrice ?? 0),
    promoPrice: input?.promoPrice ? String(input.promoPrice) : "",
    stock: String(input?.stock ?? 0),
    stockMin: String(input?.stockMin ?? 0),
    stockMax: input?.stockMax ? String(input.stockMax) : "",
    unit: input?.unit ?? "",
    supplier: input?.supplier ?? "",
    expiresAt: input?.expiresAt ? new Date(input.expiresAt).toISOString() : "",
    tags: Array.isArray(input?.tags) ? input.tags.join(", ") : "",
    isActive: Boolean(input?.isActive ?? true),
    imageUrls: images?.map((i) => i.url) ?? [],
  };
}

function parseIntOrZero(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export function ProductFormDialog(props: Props) {
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const [open, setOpen] = React.useState(false);

  const detail = useAdminProduct(props.productId ?? 0);
  const createMutation = useCreateAdminProduct();
  const updateMutation = useUpdateAdminProduct();

  const [state, setState] = React.useState<FormState>(() =>
    props.mode === "edit" ? toFormState() : toFormState()
  );

  React.useEffect(() => {
    if (!open) return;
    if (props.mode !== "edit") {
      setState(toFormState());
      return;
    }
    if (detail.data?.product) {
      setState(toFormState(detail.data.product, detail.data.images));
    }
  }, [open, props.mode, detail.data]);

  const title = props.mode === "create" ? "Nuevo producto" : "Editar producto";

  const onSubmit = async () => {
    const body = {
      name: state.name,
      description: state.description,
      categoryId: state.categoryId === "none" ? null : parseIntOrZero(state.categoryId),
      sku: state.sku.trim() ? state.sku.trim() : null,
      price: parseIntOrZero(state.price),
      costPrice: parseIntOrZero(state.costPrice),
      promoPrice: state.promoPrice.trim() ? parseIntOrZero(state.promoPrice) : null,
      stock: parseIntOrZero(state.stock),
      stockMin: parseIntOrZero(state.stockMin),
      stockMax: state.stockMax.trim() ? parseIntOrZero(state.stockMax) : null,
      unit: state.unit.trim() ? state.unit.trim() : null,
      supplier: state.supplier.trim() ? state.supplier.trim() : null,
      expiresAt: state.expiresAt.trim() ? state.expiresAt.trim() : null,
      tags: state.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isActive: state.isActive,
      imageUrls: state.imageUrls.filter(Boolean),
    };

    try {
      if (props.mode === "create") {
        await createMutation.mutateAsync({ body });
        toast({ title: "Producto creado" });
      } else {
        await updateMutation.mutateAsync({ productId: props.productId!, body });
        toast({ title: "Producto actualizado" });
      }
      setOpen(false);
    } catch (err) {
      toast({
        title: "No se pudo guardar",
        description: err instanceof Error ? err.message : "Revisa los campos e intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const addImageUrl = () => setState((s) => ({ ...s, imageUrls: [...s.imageUrls, ""] }));
  const updateImageUrl = (index: number, url: string) =>
    setState((s) => ({ ...s, imageUrls: s.imageUrls.map((u, i) => (i === index ? url : u)) }));
  const removeImageUrl = (index: number) =>
    setState((s) => ({ ...s, imageUrls: s.imageUrls.filter((_, i) => i !== index) }));
  const moveImageUrl = (from: number, to: number) =>
    setState((s) => {
      if (to < 0 || to >= s.imageUrls.length) return s;
      const copy = [...s.imageUrls];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item!);
      return { ...s, imageUrls: copy };
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {props.children ? (
        <DialogTrigger asChild>{props.children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="bg-secondary hover:bg-secondary/90">
            <Plus className="mr-2 size-4" />
            Nuevo producto
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {props.mode === "edit" && detail.isLoading ? (
          <div className="space-y-3">
            <div className="h-10 rounded bg-muted" />
            <div className="h-24 rounded bg-muted" />
            <div className="h-10 rounded bg-muted" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nombre</Label>
                <Input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descripción</Label>
                <Textarea
                  value={state.description}
                  onChange={(e) => setState({ ...state, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={state.categoryId} onValueChange={(v) => setState({ ...state, categoryId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SKU (opcional)</Label>
                <Input value={state.sku} onChange={(e) => setState({ ...state, sku: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Precio venta (centavos)</Label>
                <Input value={state.price} onChange={(e) => setState({ ...state, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Precio costo (centavos)</Label>
                <Input value={state.costPrice} onChange={(e) => setState({ ...state, costPrice: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Precio promo (centavos)</Label>
                <Input value={state.promoPrice} onChange={(e) => setState({ ...state, promoPrice: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>Stock actual</Label>
                <Input value={state.stock} onChange={(e) => setState({ ...state, stock: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock mínimo</Label>
                <Input value={state.stockMin} onChange={(e) => setState({ ...state, stockMin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock máximo</Label>
                <Input value={state.stockMax} onChange={(e) => setState({ ...state, stockMax: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select value={state.unit || "unit"} onValueChange={(v) => setState({ ...state, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="unit">unidad</SelectItem>
                    <SelectItem value="bag">saco</SelectItem>
                    <SelectItem value="liter">litro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input value={state.supplier} onChange={(e) => setState({ ...state, supplier: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fecha de vencimiento (ISO)</Label>
                <Input value={state.expiresAt} onChange={(e) => setState({ ...state, expiresAt: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Tags (separados por coma)</Label>
                <Input value={state.tags} onChange={(e) => setState({ ...state, tags: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <label className="flex items-center gap-2">
                <Checkbox checked={state.isActive} onCheckedChange={(v) => setState({ ...state, isActive: Boolean(v) })} />
                <span className="text-sm font-medium">Activo</span>
              </label>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Imágenes</div>
                <Button variant="outline" size="sm" onClick={addImageUrl}>
                  <Plus className="mr-2 size-4" />
                  Agregar
                </Button>
              </div>
              <div className="grid gap-2">
                {state.imageUrls.length ? (
                  state.imageUrls.map((url, idx) => (
                    <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                      <Input value={url} onChange={(e) => updateImageUrl(idx, e.target.value)} placeholder="https://..." />
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => moveImageUrl(idx, idx - 1)} aria-label="Subir">
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => moveImageUrl(idx, idx + 1)} aria-label="Bajar">
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => removeImageUrl(idx)} aria-label="Eliminar">
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">Sin imágenes.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={onSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                Guardar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

