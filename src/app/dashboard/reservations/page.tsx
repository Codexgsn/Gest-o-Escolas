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
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reservas</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Gerencie as reservas de recursos da escola.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/reservations/new" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Reserva
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg md:text-xl">Histórico de Reservas</CardTitle>
                    <CardDescription className="text-sm">
                        Visualize e gerencie todas as reservas realizadas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                    <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar reservas..."
                                className="pl-8 w-full"
                            />
                        </div>
                        <Button variant="outline" className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Filtrar
                        </Button>
                    </div>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Recurso</TableHead>
                                    <TableHead className="min-w-[120px]">Solicitante</TableHead>
                                    <TableHead className="min-w-[140px]">Início</TableHead>
                                    <TableHead className="min-w-[140px]">Fim</TableHead>
                                    <TableHead className="min-w-[100px]">Status</TableHead>
                                    <TableHead className="text-right w-[70px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.map((reservation) => {
                                    const isOwner = currentUserId === reservation.userId;
                                    const canEdit = isAdmin || (isOwner && reservation.status !== 'Cancelada');

                                    return (
                                        <TableRow key={reservation.id}>
                                            <TableCell className="font-medium">
                                                <span className="truncate block max-w-[200px]">{reservation.resourceName}</span>
                                            </TableCell>
                                            <TableCell><span className="truncate block max-w-[150px]">{reservation.userName}</span></TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(reservation.startTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(reservation.endTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
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
                                                    className="text-xs"
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
