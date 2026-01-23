import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <section className="bg-primary text-primary-foreground pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Contáctanos</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Estamos aquí para servirle. Visítenos en Cachipay o envíenos un mensaje.
          </p>
        </div>
      </section>

      <section className="py-20 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-display font-bold text-primary mb-6">Información de Contacto</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  ¿Tiene alguna pregunta sobre nuestros productos o servicios? 
                  Nuestro equipo de expertos está listo para asesorarle en todo lo que necesite.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Ubicación</h3>
                  <p className="text-muted-foreground text-sm">
                    Barrio Centro<br />
                    Cachipay, Cundinamarca
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Teléfono</h3>
                  <p className="text-muted-foreground text-sm">
                    +57 320 334 7765
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Email</h3>
                  <p className="text-muted-foreground text-sm break-all">
                    info@agricolacoterra.com<br />
                    ventas@agricolacoterra.com
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Horario</h3>
                  <p className="text-muted-foreground text-sm">
                    Lun - Vie: 7am - 5pm<br />
                    Sáb: 7am - 2pm
                  </p>
                </div>
              </div>

              <div className="rounded-2xl h-64 w-full overflow-hidden relative shadow-inner bg-muted">
                <iframe
                  title="Ubicación en Google Maps"
                  src="https://www.google.com/maps?q=4.7309438,-74.4356346&z=18&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </div>

            <div>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
