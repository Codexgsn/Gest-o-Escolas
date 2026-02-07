import { fetchResources } from "@/lib/data";
import { getSettings } from "@/app/actions/settings";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { NewReservationForm } from "@/components/reservations/new-reservation-form";

// This is now a Server Component to fetch data
export default async function NewReservationPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/');
    }

    // Fetch resources and settings on the server
    const resources = await fetchResources();
    const settings = await getSettings(); // Corrected function call

    // Get initial resource ID from search params if available
    const initialResourceId = typeof searchParams?.resourceId === 'string' ? searchParams.resourceId : undefined;

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
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard/reservations">Reservas</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Nova Reserva</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <h1 className="mb-4 text-2xl font-bold">Criar Nova Reserva</h1>

            {/* Pass the fetched data as props to the client component */}
            <NewReservationForm
                resources={resources || []}
                settings={settings || null}
                initialResourceId={initialResourceId}
                currentUserId={user.id}
            />
        </>
    );
}
