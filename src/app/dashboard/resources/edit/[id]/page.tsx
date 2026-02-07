
import { notFound, redirect } from 'next/navigation';
import { fetchResourceById, fetchResourceTags } from "@/lib/data";
import { EditResourceForm } from "@/components/resources/edit-resource-form";
import { getCurrentUser } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// This is the main page component, a Server Component.
export default async function EditResourcePage({ params }: { params: { id: string } }) {
  const id = params.id;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Fetch the specific resource and all available tags in parallel.
  const [resource, availableTags] = await Promise.all([
    fetchResourceById(id),
    fetchResourceTags(),
  ]);

  // If the resource doesn't exist, show a 404 page.
  if (!resource) {
    notFound();
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Recurso</CardTitle>
        <CardDescription>
          Atualize os detalhes do recurso abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pass server-fetched data to the client component */}
        <EditResourceForm resource={resource} availableTags={availableTags} currentUserId={user.id} />
      </CardContent>
    </Card>
  );
}
