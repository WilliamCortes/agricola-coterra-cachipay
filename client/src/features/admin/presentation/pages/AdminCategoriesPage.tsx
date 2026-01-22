import { AdminLayout } from "@/features/admin/presentation/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          CRUD de categorías con jerarquía, orden e imagen se implementa en la siguiente fase.
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

