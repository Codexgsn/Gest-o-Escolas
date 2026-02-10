
import { notFound, redirect } from 'next/navigation';
import { fetchReservationById, fetchResources, fetchUserById } from "@/lib/data";
import { getSettings } from "@/app/actions/settings";
import { EditReservationForm } from "@/components/reservations/edit-reservation-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Valid admin UUID found in database. In a real app, this would come from your auth solution.
const DUMMY_USER_ID = 'f2a33cb6-66ca-4081-b5ff-5076547744d9';

// This is the main page, a Server Component
export default async function EditReservationPage({ params }: { params: { id: string } }) {
  const id = params.id;

  // Fetch reservation, resources, settings, and current user in parallel
  const [reservation, resources, settings, currentUser] = await Promise.all([
    fetchReservationById(id),
    fetchResources(),
    getSettings(),
    fetchUserById(DUMMY_USER_ID) // Fetch the current user's details
  ]);

  // If no reservation is found, render the 404 page
  if (!reservation) {
    notFound();
  }

  // Check for permissions
  const isOwner = reservation.userId === currentUser?.id;
  const isAdmin = currentUser?.role === 'Admin';

  if (!isOwner && !isAdmin) {
    // If the user is not the owner and not an admin, redirect them
    redirect('/dashboard/reservations');
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Reserva</CardTitle>
        <CardDescription>
          Modifique os detalhes da sua reserva. O sistema verificará novamente por conflitos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pass the server-fetched data as props to the Client Component */}
        <EditReservationForm
          reservation={reservation}
          resources={resources}
          settings={settings}
        />
      </CardContent>
    </Card>
  );
}
