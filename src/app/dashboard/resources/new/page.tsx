
import { fetchResourceTags } from "@/lib/data";
import { NewResourceForm } from "@/components/resources/new-resource-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// This is the main page component, which is a Server Component.
export default async function NewResourcePage() {
  // Fetch data on the server
  const availableTags = await fetchResourceTags();

  return (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Adicionar Novo Recurso</CardTitle>
            <CardDescription>
                Preencha o formulário para adicionar um novo recurso (sala, objeto, etc.) para reserva.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {/* Pass server-fetched data to the client component */}
            <NewResourceForm availableTags={availableTags} />
        </CardContent>
    </Card>
  );
}
