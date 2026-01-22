import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, Tractor, ShoppingBag, Phone, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/products", label: "Productos", icon: ShoppingBag },
    { href: "/contact", label: "Contacto", icon: Phone },
  ];

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        scrolled
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
                  scrolled ? "border border-primary/20" : "border-2 border-white/50"
                )} 
              />
            </div>
            <span className={cn(
              "font-display font-bold text-xl md:text-2xl tracking-tight transition-colors",
              scrolled ? "text-primary" : "text-white"
            )}>
              Agrícola Coterra
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={cn(
                  "text-sm font-semibold tracking-wide cursor-pointer hover:text-secondary transition-colors",
                  location === link.href ? "text-secondary underline decoration-2 underline-offset-4" : "",
                  scrolled ? "text-foreground" : "text-white/90 hover:text-white"
                )}>
                  {link.label}
                </span>
              </Link>
            ))}
            <Link href="/contact">
              <Button 
                variant={scrolled ? "default" : "secondary"}
                className={cn(
                  "font-semibold rounded-full px-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5",
                  !scrolled && "bg-white text-primary hover:bg-white/90"
                )}
              >
                Solicitar Cotización
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-md transition-colors",
                scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"
              )}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
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
