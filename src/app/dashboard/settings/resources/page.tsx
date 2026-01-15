
'use client'

import Link from "next/link";
import {
  PlusCircle,
  MoreHorizontal,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Resource } from "@/lib/data";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteResourceAction } from "@/app/actions/resources";
import { Skeleton } from "@/components/ui/skeleton";
import { database } from "@/firebase";
import { ref, onValue } from "firebase/database";

function ResourceRow({ resource, onDelete }: { resource: Resource, onDelete: (id: string) => void }) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {resource.name}
      </TableCell>
      <TableCell>{resource.type}</TableCell>
      <TableCell className="hidden md:table-cell">
        {resource.location}
      </TableCell>
       <TableCell className="hidden md:table-cell">
        {resource.capacity}
      </TableCell>
      <TableCell>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/settings/resources/edit/${resource.id}`}>Editar</Link>
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
           <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o recurso e suas reservas associadas.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(resource.id)}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

function ResourcesTableSkeleton() {
    return (
        <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
              <Skeleton className="h-4 w-1/4" />
            </CardFooter>
        </Card>
    );
}

export default function ManageResourcesPage() {
  const { currentUser, isLoaded } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
        if (!currentUser || currentUser.role !== 'Admin') {
            toast({
                variant: "destructive",
                title: "Acesso Negado",
                description: "Você não tem permissão para acessar esta página.",
            });
            router.push('/dashboard');
            return;
        }

        const resourcesRef = ref(database, 'resources');
        const unsubscribe = onValue(resourcesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setResources(list);
            } else {
                setResources([]);
            }
            setIsLoading(false);
        }, (error) => {
            toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível buscar a lista de recursos." });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }
  }, [currentUser, isLoaded, router, toast]);

  const handleDeleteResource = async (resourceId: string) => {
    if (!currentUser) return;
    
    const result = await deleteResourceAction(resourceId, currentUser.id);

    if (result.success) {
        toast({
            title: "Recurso Excluído",
            description: result.message,
        })
        // Data will be updated automatically by the onValue listener
    } else {
        toast({
            title: "Erro",
            description: result.message,
            variant: 'destructive'
        })
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-32" />
            </div>
            <ResourcesTableSkeleton />
        </div>
    )
  }

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
                <Link href="/dashboard/settings">Configurações</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gerenciar Recursos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" className="h-8 gap-1">
              <Link href="/dashboard/resources/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Adicionar Recurso
                  </span>
              </Link>
            </Button>
        </div>
      </div>
      
       <Card>
            <CardHeader>
              <CardTitle>Recursos</CardTitle>
              <CardDescription>
                Gerencie todos os recursos disponíveis para reserva na instituição.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Localização</TableHead>
                    <TableHead className="hidden md:table-cell">Capacidade/Qtd.</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.length > 0 ? (
                    resources.map((res) => (
                        <ResourceRow 
                          key={res.id} 
                          resource={res} 
                          onDelete={handleDeleteResource}
                        />
                       )
                    )
                  ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Nenhum recurso encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>{resources.length}</strong> recursos
              </div>
            </CardFooter>
          </Card>
    </>
  );
}
