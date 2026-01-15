
'use client'

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
import { getSettings } from "@/app/actions/settings";
import type { Resource } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Wrench, Package, ListFilter, Tag } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { database } from "@/firebase";
import { ref, onValue } from "firebase/database";

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
            <Badge variant="secondary" className="">{resource.type}</Badge>
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

function ResourcesPageSkeleton() {
    return (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {[...Array(8)].map((_, i) => (
              <Card key={i}>
                  <CardHeader className="p-0">
                      <Skeleton className="h-48 w-full rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-6">
                      <Skeleton className="h-4 w-1/3 mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Skeleton className="h-10 w-full" />
                  </CardFooter>
              </Card>
          ))}
        </div>
    )
}

export default function ResourcesPage() {
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const resourcesRef = ref(database, 'resources');
        const unSubResources = onValue(resourcesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list: Resource[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setAllResources(list);
            }
            setIsLoading(false);
        });

        async function loadTags() {
            const settingsData = await getSettings();
            setAvailableTags(settingsData.resourceTags || []);
        }
        loadTags();

        return () => {
            unSubResources();
        };
    }, []);

    const handleTagFilterChange = (tag: string, checked: boolean) => {
        setSelectedTags(prev => 
            checked ? [...prev, tag] : prev.filter(t => t !== tag)
        );
    };

    const filteredResources = useMemo(() => {
        if (selectedTags.length === 0) {
            return allResources;
        }
        return allResources.filter(resource =>
            selectedTags.every(tag => resource.tags?.includes(tag))
        );
    }, [allResources, selectedTags]);

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
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Filtrar por Tags
                  {selectedTags.length > 0 && <Badge variant="secondary" className="ml-2">{selectedTags.length}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[250px]">
                <DropdownMenuLabel>Selecione as tags</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableTags.length > 0 ? availableTags.map(tag => (
                    <DropdownMenuCheckboxItem 
                        key={tag} 
                        checked={selectedTags.includes(tag)} 
                        onCheckedChange={(checked) => handleTagFilterChange(tag, !!checked)}
                    >
                        {tag}
                    </DropdownMenuCheckboxItem>
                )) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma tag disponível.</div>
                )}
                 {selectedTags.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setSelectedTags([])} className="text-destructive">
                            Limpar filtros
                        </DropdownMenuItem>
                    </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

        {isLoading ? (
            <ResourcesPageSkeleton />
        ) : (
            <>
                {filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                        {filteredResources.map((resource) => (
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
        )}
    </>
  );
}
