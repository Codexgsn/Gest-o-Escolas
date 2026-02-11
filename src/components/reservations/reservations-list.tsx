
'use client'

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cancelReservationAction } from "@/app/actions/reservations";
import type { Reservation } from "@/lib/definitions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

type ReservationStatus = Reservation['status'];

const statusVariant = (status: ReservationStatus) => {
    switch (status) {
        case 'Confirmada': return 'default';
        case 'Pendente': return 'secondary';
        case 'Cancelada': return 'destructive';
        default: return 'outline';
    }
}

interface ReservationsListProps {
    reservations: Reservation[];
    currentUserId: string;
    isAdmin: boolean;
}

export function ReservationsList({ reservations, currentUserId, isAdmin }: ReservationsListProps) {
    const { toast } = useToast();
    const router = useRouter();

    if (!Array.isArray(reservations)) {
        return (
            <Card>
                <CardContent>
                    <div className="text-center p-4">Carregando reservas ou nenhuma reserva encontrada.</div>
                </CardContent>
            </Card>
        );
    }

    const handleCancelReservation = async (reservationId: string) => {
        const result = await cancelReservationAction(reservationId, currentUserId);

        if (result.success) {
            toast({
                title: "Reserva Cancelada",
                description: "A reserva foi cancelada com sucesso.",
            });
            router.refresh();
        } else {
            toast({
                title: "Erro",
                description: result.message,
                variant: 'destructive'
            });
        }
    };

    const getReservationsByStatus = (statuses: ReservationStatus[]) => {
        return reservations.filter(r => statuses.includes(r.status));
    }

    const tabs = [
        { value: 'all', label: 'Todas', data: reservations },
        { value: 'confirmed', label: 'Confirmadas', data: getReservationsByStatus(['Confirmada']) },
        { value: 'pending', label: 'Pendentes', data: getReservationsByStatus(['Pendente']) },
        { value: 'cancelled', label: 'Canceladas', data: getReservationsByStatus(['Cancelada']) },
    ];

    return (
        <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                {tabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">{tab.label}</TabsTrigger>
                ))}
            </TabsList>

            {tabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value}>
                    <Card>
                        <CardHeader className="px-4 md:px-6">
                            <CardTitle className="text-lg md:text-xl">{tab.label}</CardTitle>
                            <CardDescription className="text-sm">Uma lista de todas as reservas {tab.label.toLowerCase()}.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 md:px-6">
                            <div className="overflow-x-auto">
                                <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[150px]">Recurso</TableHead>
                                        <TableHead className="min-w-[120px]">Usuário</TableHead>
                                        <TableHead className="min-w-[100px]">Status</TableHead>
                                        <TableHead className="hidden md:table-cell min-w-[150px]">Início</TableHead>
                                        <TableHead className="hidden md:table-cell min-w-[150px]">Fim</TableHead>
                                        <TableHead className="w-[70px]"><span className="sr-only">Ações</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tab.data.length > 0 ? (
                                        tab.data.map((res) => {
                                            const canModify = isAdmin || currentUserId === res.userId;
                                            return (
                                                <TableRow key={res.id}>
                                                    <TableCell className="font-medium"><span className="truncate block max-w-[200px]">{res.resourceName}</span></TableCell>
                                                    <TableCell><span className="truncate block max-w-[150px]">{res.userName}</span></TableCell>
                                                    <TableCell><Badge variant={statusVariant(res.status)} className="text-xs">{res.status}</Badge></TableCell>
                                                    <TableCell className="hidden md:table-cell text-sm">{new Date(res.startTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                                                    <TableCell className="hidden md:table-cell text-sm">{new Date(res.endTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
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
                                                                        <Link href={`/dashboard/reservations/edit/${res.id}`}>Editar</Link>
                                                                    </DropdownMenuItem>
                                                                    {res.status !== 'Cancelada' && (
                                                                        <AlertDialogTrigger asChild>
                                                                            <DropdownMenuItem disabled={!canModify}>Cancelar</DropdownMenuItem>
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
                                                                    <AlertDialogAction onClick={() => handleCancelReservation(res.id)}>Confirmar</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">Nenhuma reserva encontrada.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="text-xs text-muted-foreground">
                                Mostrando <strong>{tab.data.length}</strong> de <strong>{reservations.length}</strong> reservas filtradas.
                            </div>
                        </CardFooter>
                    </Card>
                </TabsContent>
            ))}
        </Tabs>
    );
}
