import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCategories, useProducts, useProductsByCategory } from "@/hooks/use-store";
import { ProductCard } from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { applySeo } from "@/lib/seo";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroBreadcrumbLayout } from "@/components/layout/HeroBreadcrumbLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Products() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const categorySlug = searchParams.get("category");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: categories } = useCategories();
  const { data: allProducts, isLoading } = useProducts();
  
  const filteredProducts = allProducts?.filter(product => {
    if (categorySlug) {
      const category = categories?.find(c => c.slug === categorySlug);
      if (category && product.categoryId !== category.id) return false;
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }
    
    return true;
  }) || [];

  const handleCategoryChange = (slug: string | null) => {
    if (slug) {
      setLocation(`/products?category=${slug}`);
    } else {
      setLocation("/products");
    }
  };

  const currentCategoryName = categorySlug 
    ? categories?.find(c => c.slug === categorySlug)?.name 
    : "Todos los Productos";
  const activeCategoryName = categorySlug ? categories?.find((c) => c.slug === categorySlug)?.name : null;

  useEffect(() => {
    const title = activeCategoryName
      ? `Productos | ${activeCategoryName} | Agrícola Coterra`
      : "Productos | Agrícola Coterra";

    applySeo({
      title,
      description:
        "Explora el catálogo de insumos agrícolas y alimentos para animales. Filtra por categoría y encuentra lo que necesitas.",
      canonicalPath: "/products",
    });
  }, [activeCategoryName, categorySlug]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-muted/10">
      <Navbar />

      <HeroBreadcrumbLayout
        hero={
          <div className="bg-primary text-primary-foreground pt-32 pb-16 px-4">
            <div className="container mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Nuestros Productos</h1>
              <p className="text-white/80 max-w-2xl mx-auto">
                Explore nuestro catálogo completo de insumos agrícolas y alimentos para animales.
              </p>
            </div>
          </div>
        }
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="text-muted-foreground hover:text-foreground">
                  <Link href="/">Inicio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-muted-foreground">{">"}</BreadcrumbSeparator>
              {activeCategoryName ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild className="text-muted-foreground hover:text-foreground">
                      <Link href="/products">Productos</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-muted-foreground">{">"}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-primary">{activeCategoryName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-primary">Productos</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-secondary" /> Buscar
              </h3>
              <Input
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border-input bg-muted/20"
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-secondary" /> Categorías
                </h3>
                {categorySlug && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryChange(null)}
                    className="text-xs h-6 text-muted-foreground hover:text-destructive"
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center",
                    !categorySlug ? "bg-primary text-white shadow-md" : "hover:bg-muted text-foreground/80"
                  )}
                >
                  Todos
                  {!categorySlug && (
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                      {allProducts?.length}
                    </Badge>
                  )}
                </button>

                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center",
                      categorySlug === cat.slug ? "bg-primary text-white shadow-md" : "hover:bg-muted text-foreground/80"
                    )}
                  >
                    {cat.name}
                    {categorySlug === cat.slug && (
                      <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                        {allProducts?.filter((p) => p.categoryId === cat.id).length}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-primary">{currentCategoryName}</h2>
              <span className="text-sm text-muted-foreground">Mostrando {filteredProducts.length} resultados</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-[400px] bg-white animate-pulse rounded-2xl shadow-sm border border-border/50"
                  ></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-border/50">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No se encontraron productos</h3>
                <p className="text-muted-foreground mb-6">
                  Intenta con otros términos de búsqueda o cambia la categoría.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    handleCategoryChange(null);
                  }}
                >
                  Ver todos los productos
                </Button>
              </div>
            )}
          </main>
        </div>
      </HeroBreadcrumbLayout>

      <Footer />
    </div>
  );
}
