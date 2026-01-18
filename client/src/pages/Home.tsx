import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCategories, useTestimonials, useProducts } from "@/hooks/use-store";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Star, Leaf, Dog, Wheat, Hammer, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// Helper to get icon for category
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'alimentos-animales': return Dog;
    case 'mascotas': return Dog;
    case 'insumos-agricolas': return Wheat;
    case 'herramientas': return Hammer;
    default: return Leaf;
  }
};

export default function Home() {
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: testimonials, isLoading: loadingTestimonials } = useTestimonials();

  // Get only first 4 featured products
  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* scenic rural landscape */}
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop" 
            alt="Rural Landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-4 rounded-full bg-secondary/90 text-white text-sm font-semibold tracking-wide mb-6 backdrop-blur-sm border border-white/20">
              DESDE CACHIPAY PARA EL MUNDO
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-6 leading-tight text-shadow-lg">
              Cultivamos el Futuro <br className="hidden md:block" />
              <span className="text-accent">Del Campo Colombiano</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
              Encuentre los mejores insumos, herramientas y alimentos para potenciar su producción agrícola y cuidar de sus animales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button size="lg" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl hover:scale-105 transition-all">
                  Ver Productos
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-2 border-white text-primary bg-white hover:bg-white/90 hover:text-primary font-bold text-lg shadow-xl backdrop-blur-sm hover:scale-105 transition-all">
                  Contáctanos
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
              Nuestras Categorías
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full mb-6"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesita para su finca en un solo lugar. Calidad garantizada.
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories?.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                return (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                    <div className="group cursor-pointer bg-accent/20 hover:bg-primary transition-all duration-300 rounded-2xl p-8 text-center border border-transparent hover:shadow-xl hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-secondary/10 rounded-full group-hover:bg-white/10 transition-colors"></div>
                      
                      <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                      
                      <h3 className="font-display font-bold text-xl text-primary group-hover:text-white transition-colors mb-2">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                        Ver productos <ArrowRight className="inline h-3 w-3 ml-1" />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                Productos Destacados
              </h2>
              <div className="w-20 h-1 bg-secondary rounded-full"></div>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="text-primary font-semibold hover:bg-primary/10 gap-2">
                Ver todo el catálogo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              {/* Farmer in field */}
              <div className="relative">
                <img 
                  src="https://pixabay.com/get/g437ffa1e67bd132e760ed0444f73f54c870a56070467068c9e72b027ccd1815c82e01a4d4f7556c3d33e56b14fcc86552011fe31604c8b47bc0428b637811103_1280.jpg" 
                  alt="Agricultor en campo" 
                  className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-xs hidden lg:block">
                  <div className="flex gap-4 items-center">
                    <div className="bg-secondary/10 p-3 rounded-full">
                      <CheckCircle2 className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-primary text-lg">Calidad 100%</p>
                      <p className="text-sm text-muted-foreground">Garantizada en todos nuestros productos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                Su Aliado de Confianza en el Campo
              </h2>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                En Agrícola Coterra entendemos el valor de la tierra y el trabajo duro. 
                Por eso ofrecemos solo los mejores productos, respaldados por años de 
                experiencia y un compromiso genuino con el agro colombiano.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Asesoría técnica personalizada",
                  "Envíos rápidos a toda la región",
                  "Precios competitivos y justos",
                  "Catálogo especializado para cada necesidad"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="bg-secondary rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/contact">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-full px-8 shadow-lg">
                  Hable con un Asesor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-accent/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>

          {loadingTestimonials ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials?.slice(0, 3).map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-8 rounded-2xl shadow-md border border-border/50 relative">
                  {/* Quote icon */}
                  <div className="absolute top-6 right-6 text-accent">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                    </svg>
                  </div>
                  
                  <div className="flex gap-1 mb-6 text-yellow-400">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-foreground/80 italic mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Helper component for checklist
function Check({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
