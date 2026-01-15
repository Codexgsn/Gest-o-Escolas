
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Resource } from '@/lib/data';
import { Users, MapPin, Wrench, Package } from 'lucide-react';
import { Suspense, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { database } from '@/firebase';
import { ref, onValue } from 'firebase/database';


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
        <Badge variant="secondary" className="mb-2">
          {resource.type}
        </Badge>
        <CardTitle className="text-xl mb-2">{resource.name}</CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
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

function SearchResultsSkeleton() {
    return (
       <div>
        <Skeleton className="h-9 w-1/2 mb-2" />
        <Skeleton className="h-5 w-1/4 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {[...Array(4)].map((_, i) => (
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
      </div>
    )
}

function SearchResultsInternal() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    const resourcesRef = ref(database, 'resources');
    const unsubscribe = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Resource[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setAllResources(list);
      } else {
        setAllResources([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading || !query) {
      if (!query) setFilteredResources([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const results = allResources.filter((resource) => 
        resource.name.toLowerCase().includes(searchTerm) ||
        resource.type.toLowerCase().includes(searchTerm) ||
        resource.location.toLowerCase().includes(searchTerm) ||
        (Array.isArray(resource.equipment) && resource.equipment.some((e) => e.toLowerCase().includes(searchTerm))) ||
        (Array.isArray(resource.tags) && resource.tags.some((t) => t.toLowerCase().includes(searchTerm)))
    );
    setFilteredResources(results);

  }, [query, allResources, isLoading]);


  if (isLoading && !filteredResources.length) {
    return <SearchResultsSkeleton />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Resultados da Pesquisa por: "{query}"
      </h1>
      <p className="text-muted-foreground mt-2">
        {filteredResources.length > 0
          ? `Encontrado(s) ${filteredResources.length} recurso(s).`
          : 'Nenhum recurso encontrado.'}
      </p>

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        !isLoading && (
            <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">Tente um termo de busca diferente.</p>
            </div>
        )
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResultsInternal />
        </Suspense>
    )
}
