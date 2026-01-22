import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema, type InsertMessage } from "@shared/schema";
import { useContactMutation } from "@/hooks/use-store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

export function ContactForm() {
  const mutation = useContactMutation();
  
  const form = useForm<Omit<InsertMessage, "id">>({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: Omit<InsertMessage, "id">) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-border/50">
      <h3 className="text-2xl font-display font-bold text-primary mb-6">Envíanos un mensaje</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80 font-medium">Nombre Completo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Juan Pérez" 
                    className="h-12 rounded-xl bg-accent/20 border-transparent focus:bg-white focus:border-primary/50 transition-all"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80 font-medium">Correo Electrónico</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="juan@ejemplo.com" 
                    type="email"
                    className="h-12 rounded-xl bg-accent/20 border-transparent focus:bg-white focus:border-primary/50 transition-all"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80 font-medium">Tu Mensaje</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="¿En qué podemos ayudarte hoy?" 
                    className="min-h-[120px] rounded-xl bg-accent/20 border-transparent focus:bg-white focus:border-primary/50 transition-all resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                Enviar Mensaje <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
