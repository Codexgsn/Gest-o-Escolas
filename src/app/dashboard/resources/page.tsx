
import Link from "next/link";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Resource } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Wrench, Package, ListFilter, Tag } from "lucide-react";
import { fetchResources, fetchResourceTags } from "@/lib/data";
import { FilterDropdown } from "@/components/resources/filter-dropdown";


function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
            {resource.imageUrl && (
                <Image
                    src={resource.imageUrl}
                    alt={resource.name}
                    fill
                    className="object-cover rounded-t-lg"
                />
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="secondary">{resource.type}</Badge>
            {resource.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
            ))}
        </div>
        <CardTitle className="text-xl mb-2">{resource.name}</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4"/>
                <span>{resource.location}</span>
            </div>
            <div className="flex items-center gap-2">
                {resource.capacity > 1 ? <Users className="h-4 w-4"/> : <Package className="h-4 w-4"/>}
                <span>
                  {resource.capacity > 1 ? `Capacidade: ${resource.capacity} pessoas` : `Quantidade: ${resource.capacity}`}
                </span>
            </div>
             {resource.equipment && resource.equipment.length > 0 && resource.equipment[0] !== "" && (
              <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4"/>
                  <span className="truncate">{Array.isArray(resource.equipment) ? resource.equipment.join(", ") : resource.equipment}</span>
              </div>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/reservations/new?resourceId=${resource.id}`}>
            Reservar Agora
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function ResourcesPage({ searchParams }: { searchParams?: { tags?: string | string[] }}) {
  const selectedTags = 
    typeof searchParams?.tags === 'string' ? [searchParams.tags] :
    Array.isArray(searchParams?.tags) ? searchParams.tags : [];

  const [resources, availableTags] = await Promise.all([
    fetchResources(selectedTags),
    fetchResourceTags()
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
              <BreadcrumbPage>Recursos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Catálogo de Recursos</h1>
            <p className="text-muted-foreground mt-2">Navegue e reserve salas, laboratórios e equipamentos disponíveis.</p>
        </div>
        <div className="mt-4 md:mt-0">
            <FilterDropdown availableTags={availableTags} selectedTags={selectedTags} />
        </div>
      </div>

      {resources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
              ))}
          </div>
      ) : (
            <div className="text-center py-16">
              <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum Recurso Encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                  Tente remover alguns filtros para ver mais resultados.
              </p>
          </div>
      )}
    </>
  );
}
