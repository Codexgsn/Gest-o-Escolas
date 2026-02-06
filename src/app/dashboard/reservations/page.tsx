import { getReservations } from '@/app/actions/reservations';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CalendarDays, MoreHorizontal, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { CancelReservationButton } from '@/components/reservations/cancel-reservation-button';

export default async function ReservationsPage() {
    const reservations = await getReservations();
    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === 'Admin';
    const currentUserId = currentUser?.id;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
                    <p className="text-muted-foreground">
                        Gerencie as reservas de recursos da escola.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/reservations/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Reserva
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Reservas</CardTitle>
                    <CardDescription>
                        Visualize e gerencie todas as reservas realizadas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar reservas..."
                                className="pl-8 sm:w-[300px] md:w-[300px]"
                            />
                        </div>
                        <Button variant="outline">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Filtrar por Data
                        </Button>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Recurso</TableHead>
                                    <TableHead>Solicitante</TableHead>
                                    <TableHead>Início</TableHead>
                                    <TableHead>Fim</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.map((reservation) => {
                                    const isOwner = currentUserId === reservation.userId;
                                    const canEdit = isAdmin || (isOwner && reservation.status !== 'Cancelada');

                                    return (
                                        <TableRow key={reservation.id}>
                                            <TableCell className="font-medium">
                                                {reservation.resourceName}
                                            </TableCell>
                                            <TableCell>{reservation.userName}</TableCell>
                                            <TableCell>
                                                {new Date(reservation.startTime).toLocaleString('pt-BR')}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(reservation.endTime).toLocaleString('pt-BR')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        reservation.status === 'Confirmada'
                                                            ? 'default'
                                                            : reservation.status === 'Pendente'
                                                                ? 'secondary'
                                                                : 'destructive'
                                                    }
                                                >
                                                    {reservation.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {canEdit && (
                                                            <>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/dashboard/reservations/edit/${reservation.id}`}>Editar</Link>
                                                                </DropdownMenuItem>
                                                                <CancelReservationButton reservationId={reservation.id} currentUserId={currentUserId!} />
                                                            </>
                                                        )}
                                                        {!canEdit && (
                                                            <DropdownMenuItem disabled>Sem permissão</DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
