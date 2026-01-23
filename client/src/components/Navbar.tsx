import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Phone, Home, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import { useCart } from "@/features/cart/presentation/CartProvider";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { itemsCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomeRoute = location === "/";
  const isSolid = scrolled || !isHomeRoute;

  const links = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/products", label: "Productos", icon: ShoppingBag },
    { href: "/contact", label: "Contacto", icon: Phone },
  ];

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isSolid
          ? "bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-border/50"
          : "bg-transparent py-4 md:py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
     <div className="relative group-hover:scale-105 transition-transform duration-300">
              <img 
                src={logoImg} 
                alt="Agrícola Coterra Logo" 
                className={cn(
                  "h-12 w-12 md:h-14 md:w-14 object-contain rounded-full bg-white p-0.5 shadow-sm",
                  isSolid ? "border border-primary/20" : "border-2 border-white/50"
                )} 
              />
            </div>
            <span className={cn(
              "font-display font-bold text-xl md:text-2xl tracking-tight transition-colors",
              isSolid ? "text-primary" : "text-white"
            )}>
              Agrícola Coterra
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={cn(
                  "text-sm font-semibold tracking-wide cursor-pointer hover:text-secondary transition-colors",
                  location === link.href ? "text-secondary underline decoration-2 underline-offset-4" : "",
                  isSolid ? "text-foreground" : "text-white/90 hover:text-white"
                )}>
                  {link.label}
                </span>
              </Link>
            ))}
            <Link href="/cart" className="relative">
              <span
                className={cn(
                  "inline-flex items-center justify-center h-10 w-10 rounded-full transition-colors cursor-pointer",
                  isSolid ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"
                )}
                aria-label="Carrito"
              >
                <ShoppingCart className="h-5 w-5" />
              </span>
              {itemsCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-secondary text-white text-[11px] font-bold flex items-center justify-center shadow">
                  {itemsCount}
                </span>
              ) : null}
            </Link>
            <Link href="/contact">
              <Button 
                variant={isSolid ? "default" : "secondary"}
                className={cn(
                  "font-semibold rounded-full px-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5",
                  !isSolid && "bg-white text-primary hover:bg-white/90"
                )}
              >
                Solicitar Cotización
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-md transition-colors",
                isSolid ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"
              )}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-border animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col p-4 space-y-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    location === link.href ? "bg-accent/50 text-primary font-semibold" : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </div>
              </Link>
            ))}
            <Link href="/cart">
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  location === "/cart" ? "bg-accent/50 text-primary font-semibold" : "text-foreground hover:bg-muted"
                )}
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="flex items-center gap-2">
                  Carrito
                  {itemsCount > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-secondary text-white text-[11px] font-bold">
                      {itemsCount}
                    </span>
                  ) : null}
                </span>
              </div>
            </Link>
            <Link href="/contact">
              <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-white" onClick={() => setIsOpen(false)}>
                Solicitar Cotización
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
