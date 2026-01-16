
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import Link from "next/link";
import { File, ListFilter, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/definitions";
import { ScrollArea } from "@/components/ui/scroll-area";


interface ReservationsToolbarProps {
    allUsers: User[];
    isAdmin: boolean;
}

type ReservationStatus = 'Confirmada' | 'Pendente' | 'Cancelada';

export function ReservationsToolbar({ allUsers, isAdmin }: ReservationsToolbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (params: Record<string, string | string[] | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([key, value]) => {
                if (value === null) {
                    newSearchParams.delete(key);
                } else if (Array.isArray(value)) {
                    newSearchParams.delete(key); // Clear existing values
                    value.forEach(v => newSearchParams.append(key, v));
                } else {
                    newSearchParams.set(key, value);
                }
            });
            return newSearchParams.toString();
        },
        [searchParams]
    );

    const selectedStatuses = searchParams.getAll('status') as ReservationStatus[];
    const showAll = searchParams.get('showAll') === 'true';

    const handleStatusFilterChange = (status: ReservationStatus, checked: boolean) => {
        const newStatuses = checked
            ? [...selectedStatuses, status]
            : selectedStatuses.filter(s => s !== status);
        router.push(`${pathname}?${createQueryString({ status: newStatuses.length > 0 ? newStatuses : null })}`);
    };

    const handleShowAllChange = (checked: boolean) => {
        router.push(`${pathname}?${createQueryString({ showAll: checked ? 'true' : null })}`);
    };

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gerenciador de Reservas</h1>
                <p className="text-muted-foreground mt-2">Visualize e administre todas as suas reservas.</p>
            </div>
            <div className="flex items-center gap-2">
                 <Button asChild size="sm" className="h-8 gap-1">
                    <Link href="/dashboard/reservations/new">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Nova Reserva
                        </span>
                    </Link>
                </Button>
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
                        {(['Confirmada', 'Pendente', 'Cancelada'] as ReservationStatus[]).map(status => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={selectedStatuses.includes(status)}
                                onCheckedChange={(checked) => handleStatusFilterChange(status, !!checked)}
                            >
                                {status}
                            </DropdownMenuCheckboxItem>
                        ))}
                        
                        {isAdmin && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Filtrar por visualização</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem
                                    checked={showAll}
                                    onCheckedChange={handleShowAllChange}
                                >
                                    Mostrar todas
                                </DropdownMenuCheckboxItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1" disabled>
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Exportar
                    </span>
                </Button>
            </div>
        </div>
    );
}
