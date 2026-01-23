import type { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/features/cart/presentation/CartProvider";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const [added, setAdded] = useState(false);
  const { addProduct } = useCart();

  const price = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(product.price);

  const handleAddToCart = () => {
    addProduct(product, 1);
    setAdded(true);
    toast({
      title: "Producto agregado",
      description: `${product.name} se ha agregado a tu carrito.`,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white">
      <div className="relative aspect-square overflow-hidden bg-accent/20">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm font-medium">Sin imagen</span>
          </div>
        )}
        
        {product.stock && product.stock < 10 && (
          <Badge variant="destructive" className="absolute top-3 right-3 shadow-sm">
            ¡Últimas unidades!
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5 flex-grow">
        <h3 className="font-display font-bold text-lg text-primary mb-2 line-clamp-1" title={product.name}>
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
          {product.description}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-secondary">{price}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 mt-auto">
        <Button 
          className="w-full font-semibold gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant={added ? "secondary" : "outline"}
          onClick={handleAddToCart}
          disabled={added || (product.stock !== null && product.stock !== undefined && product.stock <= 0)}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Agregado
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> Agregar al Carrito
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
