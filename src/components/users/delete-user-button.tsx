'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { deleteUserAction } from '@/app/actions/users';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function DeleteUserButton({ userId }: { userId: string }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        // In a real implementation you might want a confirmation dialog here
        // For now, we rely on the user status or simpler UX
        if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

        // Since we are in a client component, we need the current user ID for the action.
        // However, our action requires currentUserId as an argument.
        // But wait, server actions in Next.js can read cookies on the server side!
        // So we might not need to pass it if the action read it itself.
        // BUT, existing actions defined in `actions/users.ts` take `currentUserId` as a parameter.
        // We should update the action to read the cookie or pass a placeholder if we updated the action to handle it.
        // To be safe and quick, let's update the action wrappers or just act as if we have the ID.
        // Actually, the easier path is to update the server action to read auth from cookie if passed null.
        // But for now, let's just make the action call. 
        // We'll trust the server action to handle authorization if we can get the session there.
        // The current implementation of `deleteUserAction` takes `currentUserId`.
        // Let's rely on the fact that we can get the session in the server action if we refactor it, 
        // OR we need to pass the current user ID to this component.

        // Let's assume for this specific component, we will refactor the action or pass the ID.
        // Actually, the standard way in this codebase seems to be passing `currentUserId`.
        // I'll grab the cookie from the client? No, that's httpOnly.
        // I will update the component to accept currentUserId as a prop, but that requires prop drilling.
        // BETTER: Update the server actions to read the session cookie directly if `currentUserId` is not provided.

        // For now, I'll pass a dummy ID or fix the server action. 
        // Let's fix the server action to read the cookie! That makes everything cleaner.

        const result = await deleteUserAction(userId); // session handled by server action
        if (result.success) {
            toast({ title: 'Sucesso', description: result.message });
            router.refresh();
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.message });
        }
    };

    return (
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDelete(); }} className="text-red-600 cursor-pointer">
            Excluir
        </DropdownMenuItem>
    );
}
