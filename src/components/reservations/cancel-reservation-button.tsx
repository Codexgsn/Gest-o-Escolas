'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cancelReservationAction } from '@/app/actions/reservations';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function CancelReservationButton({ reservationId, currentUserId }: { reservationId: string, currentUserId: string }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;

        // Since we are canceling, we need to pass the current user ID for validation in the server action
        const result = await cancelReservationAction(reservationId, currentUserId);

        if (result.success) {
            toast({ title: 'Sucesso', description: result.message });
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.message });
        }
    };

    return (
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleCancel(); }} className="text-red-600 cursor-pointer">
            Cancelar
        </DropdownMenuItem>
    );
}
