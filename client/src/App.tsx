import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieBanner } from "@/components/CookieBanner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import AdminLoginPage from "@/features/admin/presentation/pages/AdminLoginPage";
import AdminForgotPasswordPage from "@/features/admin/presentation/pages/AdminForgotPasswordPage";
import AdminResetPasswordPage from "@/features/admin/presentation/pages/AdminResetPasswordPage";
import AdminOverviewPage from "@/features/admin/presentation/pages/AdminOverviewPage";
import AdminProductsPage from "@/features/admin/presentation/pages/AdminProductsPage";
import AdminInventoryPage from "@/features/admin/presentation/pages/AdminInventoryPage";
import AdminOrdersPage from "@/features/admin/presentation/pages/AdminOrdersPage";
import AdminCustomersPage from "@/features/admin/presentation/pages/AdminCustomersPage";
import AdminCategoriesPage from "@/features/admin/presentation/pages/AdminCategoriesPage";
import AdminReportsPage from "@/features/admin/presentation/pages/AdminReportsPage";
import AdminSettingsPage from "@/features/admin/presentation/pages/AdminSettingsPage";

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/forgot-password" component={AdminForgotPasswordPage} />
      <Route path="/admin/reset-password" component={AdminResetPasswordPage} />
      <Route path="/admin/productos" component={AdminProductsPage} />
      <Route path="/admin/inventario" component={AdminInventoryPage} />
      <Route path="/admin/pedidos" component={AdminOrdersPage} />
      <Route path="/admin/clientes" component={AdminCustomersPage} />
      <Route path="/admin/categorias" component={AdminCategoriesPage} />
      <Route path="/admin/reportes" component={AdminReportsPage} />
      <Route path="/admin/configuracion" component={AdminSettingsPage} />
      <Route path="/admin" component={AdminOverviewPage} />
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <WhatsAppButton />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
