
'use client';

import Link from "next/link";
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  type Reservation,
  type User,
  type Resource,
} from "@/lib/data";
import React, { useState, useMemo, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cancelReservationAction } from "@/app/actions/reservations";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { database } from "@/firebase";
import { ref, onValue } from "firebase/database";

type ReservationStatus = Reservation['status'];

function ReservationRow({ 
  reservation, 
  user,
  resource,
  onCancel,
  canModify,
}: { 
  reservation: Reservation,
  user: User | undefined,
  resource: Resource | undefined,
  onCancel: (reservationId: string) => void,
  canModify: boolean,
}) {
  const statusVariant = (status: Reservation['status']) => {
    switch (status) {
        case 'Confirmada': return 'default';
        case 'Pendente': return 'secondary';
        case 'Cancelada': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {resource?.name || "Recurso Desconhecido"}
      </TableCell>
      <TableCell>{user?.name || "Usuário Desconhecido"}</TableCell>
      <TableCell>
        <Badge variant={statusVariant(reservation.status)}>{reservation.status}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(reservation.startTime).toLocaleString()}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(reservation.endTime).toLocaleString()}
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
                {canModify ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/reservations/edit/${reservation.id}`}>Editar</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem disabled>Editar</DropdownMenuItem>
                )}
                {canModify && reservation.status !== 'Cancelada' && (
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>Cancelar</DropdownMenuItem>
                  </AlertDialogTrigger>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
             <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso cancelará permanentemente a reserva.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onCancel(reservation.id)}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

function ReservationsTable({ 
    reservations, 
    userMap,
    resourceMap,
    onCancel, 
    currentUser 
}: { 
    reservations: Reservation[],
    userMap: Map<string, User>,
    resourceMap: Map<string, Resource>,
    onCancel: (id: string) => void,
    currentUser: User | null 
}) {
    return (
        <Card>
            <CardHeader>
              <CardTitle>Reservas</CardTitle>
              <CardDescription>
                Gerencie todas as reservas para os recursos da escola.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Início
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Fim
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length > 0 ? (
                    reservations.map((res) => {
                       const canModify = currentUser?.role === 'Admin' || currentUser?.id === res.userId;
                       const user = userMap.get(res.userId);
                       const resource = resourceMap.get(res.resourceId);
                       return (
                        <ReservationRow 
                          key={res.id} 
                          reservation={res}
                          user={user}
                          resource={resource}
                          onCancel={() => onCancel(res.id)}
                          canModify={canModify}
                        />
                       )
                    })
                  ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">Nenhuma reserva encontrada.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>{reservations.length}</strong> reservas
              </div>
            </CardFooter>
          </Card>
    )
}

function ReservationsPageSkeleton() {
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
                            {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                {[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
              <Skeleton className="h-4 w-1/4" />
            </CardFooter>
        </Card>
    )
}

export default function ReservationsPage() {
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [userMap, setUserMap] = useState<Map<string, User>>(new Map());
  const [resourceMap, setResourceMap] = useState<Map<string, Resource>>(new Map());

  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [statusFilters, setStatusFilters] = useState<ReservationStatus[]>(['Confirmada', 'Pendente', 'Cancelada']);
  const [showOnlyMyReservations, setShowOnlyMyReservations] = useState(true);
  const [userFilters, setUserFilters] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';
  
  useEffect(() => {
    setIsLoading(true);

    const usersRef = ref(database, 'users');
    const resourcesRef = ref(database, 'resources');
    const reservationsRef = ref(database, 'reservations');

    const unsubs: (() => void)[] = [];

    unsubs.push(onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list: User[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setAllUsers(list);
            setUserMap(new Map(list.map(u => [u.id, u])));
        }
    }));
    
    unsubs.push(onValue(resourcesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list: Resource[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setAllResources(list);
            setResourceMap(new Map(list.map(r => [r.id, r])));
        }
    }));

    unsubs.push(onValue(reservationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list: Reservation[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                startTime: new Date(data[key].startTime),
                endTime: new Date(data[key].endTime)
            }));
            setAllReservations(list);
        }
        setIsLoading(false); // Set loading to false after the primary data is fetched
    }, (error) => {
        toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível buscar os dados." });
        setIsLoading(false);
    }));

    return () => {
        unsubs.forEach(unsub => unsub());
    };
  }, [toast]);

  const handleCancelReservation = async (reservationId: string) => {
    if (!currentUser) return;

    const result = await cancelReservationAction(reservationId, currentUser.id);

    if (result.success) {
        toast({
            title: "Reserva Cancelada",
            description: "A reserva foi cancelada com sucesso.",
        })
    } else {
        toast({
            title: "Erro",
            description: result.message,
            variant: 'destructive'
        })
    }
  };

  const handleStatusFilterChange = (status: ReservationStatus, checked: boolean) => {
    setStatusFilters(prev => 
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };
  
  const handleUserFilterChange = (userId: string, checked: boolean) => {
    setUserFilters(prev =>
        checked ? [...prev, userId] : prev.filter(id => id !== userId)
    );
  };

 const filteredReservations = useMemo(() => {
    let filteredByStatus = allReservations.filter(res => statusFilters.includes(res.status));

    if (showOnlyMyReservations) {
        return filteredByStatus.filter(res => res.userId === currentUser?.id);
    }
    
    // Logic when "Apenas minhas reservas" is UNCHECKED
    if (isAdmin) {
        if (userFilters.length > 0) {
            return filteredByStatus.filter(res => userFilters.includes(res.userId));
        } else {
            return filteredByStatus;
        }
    } else {
        // For non-admins, if "Apenas minhas reservas" is unchecked, they should see all reservations
        // but can still filter by specific users if they choose to (though the UI might not be ideal for this)
        if (userFilters.length > 0) {
            return filteredByStatus.filter(res => userFilters.includes(res.userId));
        } else {
            return filteredByStatus; 
        }
    }

}, [allReservations, statusFilters, showOnlyMyReservations, currentUser, userFilters, isAdmin]);



  const getTabReservations = (statuses: ReservationStatus[]) => {
     return filteredReservations.filter(res => statuses.includes(res.status));
  }

  const allTabReservations = filteredReservations;
  const confirmedTabReservations = getTabReservations(['Confirmada']);
  const pendingTabReservations = getTabReservations(['Pendente']);
  const cancelledTabReservations = getTabReservations(['Cancelada']);

  const tableProps = {
      userMap,
      resourceMap,
      onCancel: handleCancelReservation,
      currentUser
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
              <BreadcrumbPage>Reservas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" className="h-8 gap-1">
              <Link href="/dashboard/reservations/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Nova Reserva
                  </span>
              </Link>
            </Button>
        </div>
      </div>
      
       <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="cancelled" className="hidden sm:flex">
              Canceladas
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filtrar
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Confirmada')} onCheckedChange={(checked) => handleStatusFilterChange('Confirmada', !!checked)}>
                  Confirmada
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Pendente')} onCheckedChange={(checked) => handleStatusFilterChange('Pendente', !!checked)}>Pendente</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Cancelada')} onCheckedChange={(checked) => handleStatusFilterChange('Cancelada', !!checked)}>Cancelada</DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar por visualização</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={showOnlyMyReservations}
                  onCheckedChange={setShowOnlyMyReservations}
                >
                  Apenas minhas reservas
                </DropdownMenuCheckboxItem>

                
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filtrar por usuário</DropdownMenuLabel>
                   <ScrollArea className="h-48">
                    {allUsers.map(user => (
                      <DropdownMenuCheckboxItem
                        key={user.id}
                        checked={userFilters.includes(user.id)}
                        onCheckedChange={(checked) => handleUserFilterChange(user.id, !!checked)}
                        disabled={showOnlyMyReservations}
                      >
                        {user.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </ScrollArea>
                  
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1" disabled>
              <File className="h-3.5 w-3.s5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar
              </span>
            </Button>
          </div>
        </div>
        {isLoading ? (
            <div className="mt-4">
                <ReservationsPageSkeleton />
            </div>
        ) : (
            <>
                <TabsContent value="all">
                    <ReservationsTable reservations={allTabReservations} {...tableProps} />
                </TabsContent>
                <TabsContent value="confirmed">
                    <ReservationsTable reservations={confirmedTabReservations} {...tableProps} />
                </TabsContent>
                <TabsContent value="pending">
                    <ReservationsTable reservations={pendingTabReservations} {...tableProps} />
                </TabsContent>
                <TabsContent value="cancelled">
                    <ReservationsTable reservations={cancelledTabReservations} {...tableProps} />
                </TabsContent>
            </>
        )}
      </Tabs>
    </>
  );
}
