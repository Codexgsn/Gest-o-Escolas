
import { NewResourceForm } from "@/components/resources/new-resource-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

// This is the main page component, which is a Server Component.
export default async function NewResourcePage() {
  // Get current user from session
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // The 'tags' feature is temporarily disabled to allow the build to pass.
  // A migration is needed to add the 'tags' column to the database.
  const availableTags: string[] = [];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Adicionar Novo Recurso</CardTitle>
        <CardDescription>
          Preencha o formulário para adicionar um novo recurso (sala, objeto, etc.) para reserva.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pass current user ID and empty array for tags */}
        <NewResourceForm availableTags={availableTags} currentUserId={user.id} />
      </CardContent>
    </Card>
  );
}
