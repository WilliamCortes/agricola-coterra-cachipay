import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Tractor, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import logoImg from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
            <div className="relative group hover:scale-105 transition-transform duration-300">
              <img 
                src={logoImg} 
                alt="Agrícola Coterra Logo" 
                className={cn(
                  "h-12 w-12 md:h-14 md:w-14 object-contain rounded-full bg-white p-0.5 shadow-sm border-2 border-white/50"
                )} 
              />
            </div>
              <span className="font-display font-bold text-xl tracking-tight">Agrícola Coterra</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed text-sm">
              Apoyando el agro colombiano con los mejores insumos, herramientas y asesoría experta para sus cultivos y animales.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Enlaces Rápidos</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-primary-foreground/80 hover:text-white hover:translate-x-1 transition-all inline-block">Inicio</Link>
              </li>
              <li>
                <Link href="/products" className="text-primary-foreground/80 hover:text-white hover:translate-x-1 transition-all inline-block">Nuestros Productos</Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/80 hover:text-white hover:translate-x-1 transition-all inline-block">Contáctanos</Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-primary-foreground/80 hover:text-white hover:translate-x-1 transition-all inline-block"
                >
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Contacto</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">
                  Vereda El Centro<br />
                  Cachipay, Cundinamarca
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-primary-foreground/80">+57 320 334 7765</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-primary-foreground/80">info@agricolacoterra.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-white">Horario</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex justify-between">
                <span>Lunes - Viernes</span>
                <span className="font-medium text-white">7:00 AM - 5:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sábados</span>
                <span className="font-medium text-white">7:00 AM - 2:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Domingos</span>
                <span className="font-medium text-secondary">Cerrado</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/60 text-center md:text-left">
            &copy; {new Date().getFullYear()} Agrícola Coterra. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-secondary/80 hover:text-white transition-colors text-primary-foreground/80">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-secondary/80 hover:text-white transition-colors text-primary-foreground/80">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-secondary/80 hover:text-white transition-colors text-primary-foreground/80">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
