
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchReservations, fetchUsers, fetchUserById } from "@/lib/data";
import { ReservationsList } from "@/components/reservations/reservations-list";
import { ReservationsToolbar } from "@/components/reservations/reservations-toolbar";

export default async function ReservationsPage({ 
    searchParams 
}: { 
    searchParams?: { 
        status?: string | string[];
        userId?: string;
        showAll?: string; // 'true' or 'false'
    };
}) {
    // Simulate getting the current user. In a real app, this would come from your auth solution.
    const currentUserId = 'simulated-admin-id'; // This is the admin user we created
    const currentUser = await fetchUserById(currentUserId);
    const isAdmin = currentUser?.role === 'Admin';

    // Prepare filters for the fetchReservations function
    const filters = {
        status: searchParams?.status || ['Confirmada', 'Pendente'],
        // If showAll is true and the user is an admin, don't filter by user.
        // Otherwise, only show the current user's reservations unless a specific userId is passed.
        userId: (isAdmin && searchParams?.showAll === 'true') ? searchParams?.userId : (searchParams?.userId || currentUserId),
        showAll: isAdmin && searchParams?.showAll === 'true',
        currentUserId: currentUserId,
    };

    const [reservations, allUsers] = await Promise.all([
        fetchReservations(filters),
        isAdmin ? fetchUsers() : [], // Only fetch all users if the current user is an admin
    ]);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">Painel</Link>
                    </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbPage>Reservas</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="space-y-4">
                {/* The toolbar is a client component that will manage filter changes */}
                <ReservationsToolbar 
                    allUsers={allUsers} 
                    isAdmin={isAdmin}
                />
                {/* The list is a client component that displays the data and handles actions */}
                <ReservationsList 
                    reservations={reservations} 
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                />
            </div>
        </>
    );
}
