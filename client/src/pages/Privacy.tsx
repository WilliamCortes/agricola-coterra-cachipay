import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { HeroBreadcrumbLayout } from "@/components/layout/HeroBreadcrumbLayout";
import { useEffect } from "react";
import { applySeo } from "@/lib/seo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Privacy() {
  useEffect(() => {
    applySeo({
      title: "Política de Privacidad | Agrícola Coterra",
      description: "Información sobre cookies, tratamiento de datos y contacto.",
      canonicalPath: "/privacy",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <HeroBreadcrumbLayout
        hero={
          <section className="bg-primary text-primary-foreground pt-32 pb-16 px-4">
            <div className="container mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">Política de Privacidad</h1>
              <p className="text-white/80 max-w-2xl mx-auto">
                Información sobre el uso de cookies, tratamiento de datos y contacto.
              </p>
            </div>
          </section>
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
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-primary">Política de Privacidad</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      >
        <section className="py-16 bg-white flex-grow">
          <div className="container mx-auto px-4 max-w-3xl space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-display font-bold text-primary">Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies para mejorar la experiencia de navegación, recordar preferencias y entender el uso del
                sitio. Puedes aceptar o cerrar el aviso de cookies cuando aparezca.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-display font-bold text-primary">Datos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Si nos contactas a través de los formularios, podremos almacenar tu nombre, correo y mensaje para
                responder tu solicitud.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-display font-bold text-primary">Contacto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para dudas relacionadas con privacidad, escríbenos por WhatsApp o usa la sección de contacto.
              </p>
            </div>
          </div>
        </section>
      </HeroBreadcrumbLayout>

      <Footer />
    </div>
  );
}
