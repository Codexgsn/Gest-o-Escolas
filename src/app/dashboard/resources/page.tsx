import { getResources, getResourceTags } from '@/app/actions/resources';
import { FilterDropdown } from "@/components/resources/filter-dropdown";
import { Resource } from "@/lib/definitions";
import ResourceCard from "@/components/resources/resource-card";
import { Suspense } from "react";
import { ResourcesTableSkeleton } from "@/components/resources/skeletons";
import { getCurrentUser } from '@/lib/session';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

// Componente para exibir a lista de recursos
async function ResourcesList({ searchParams, isAdmin, currentUserId }: { searchParams: { tags?: string }, isAdmin: boolean, currentUserId?: string | null }) {
    const resources = await getResources();
    const selectedTags = searchParams.tags?.split(',') || [];

    // Filtra recursos no servidor (ou na memória aqui se a query SQL não filtrar)
    const filteredResources = selectedTags.length === 0
        ? resources
        : resources.filter((resource: Resource) =>
            selectedTags.every(tag => resource.tags?.includes(tag))
        );

    if (filteredResources.length === 0) {
        return (
            <div className="col-span-full text-center text-muted-foreground py-10">
                Nenhum recurso encontrado com os filtros selecionados.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredResources.map((resource: any) => (
                <ResourceCard key={resource.id} resource={resource} isAdmin={isAdmin} currentUserId={currentUserId} />
            ))}
        </div>
    );
}

export default async function ResourcesPage({
    searchParams,
}: {
    searchParams: { tags?: string };
}) {
    const availableTags = await getResourceTags();
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'Admin';
    const currentUserId = currentUser?.id;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Recursos Disponíveis</h1>
                    <p className="text-muted-foreground">
                        Explore e reserve os recursos disponíveis na sua instituição.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <FilterDropdown availableTags={availableTags} />
                    {isAdmin && (
                        <Button asChild>
                            <Link href="/dashboard/resources/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Novo
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <Suspense fallback={<ResourcesTableSkeleton />}>
                <ResourcesList searchParams={searchParams} isAdmin={isAdmin} currentUserId={currentUserId} />
            </Suspense>
        </div>
    );
}
