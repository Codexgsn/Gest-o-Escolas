
import { Suspense } from "react";
import { fetchResources } from "@/lib/data";
import { getSettings } from "@/app/actions/settings";
import { NewReservationForm } from "@/components/reservations/new-reservation-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


function FormSkeleton() {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
             <Skeleton className="h-24 w-60" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    );
}

// This is the main page, a Server Component
export default async function NewReservationPage({ searchParams }: { searchParams?: { resourceId?: string } }) {

  // Fetch resources and settings in parallel on the server
  const [resources, settings] = await Promise.all([
    fetchResources(),
    getSettings()
  ]);

  const resourceId = searchParams?.resourceId;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Criar Nova Reserva</CardTitle>
        <CardDescription>
          Preencha o formulário para agendar um recurso. O sistema verificará
          automaticamente por conflitos e usará os horários da instituição.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<FormSkeleton />}>
            {/* Pass the server-fetched data as props to the Client Component */}
            <NewReservationForm 
                resources={resources} 
                settings={settings} 
                initialResourceId={resourceId} 
            />
        </Suspense>
      </CardContent>
    </Card>
  );
}
