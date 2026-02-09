'use client';

import { useState } from "react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Resource } from "@/lib/definitions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { deleteResourceAction } from "@/app/actions/resources";
import { useToast } from "@/hooks/use-toast";

interface ResourceCardProps {
  resource: Resource;
  isAdmin?: boolean;
  currentUserId?: string | null;
}

export default function ResourceCard({ resource, isAdmin = false, currentUserId }: ResourceCardProps) {
  const { toast } = useToast();
  const [hasError, setHasError] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este recurso?")) return;

    if (!currentUserId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não identificado.' });
      return;
    }

    const result = await deleteResourceAction(resource.id);
    if (result.success) {
      toast({ title: 'Sucesso', description: result.message });
      // Note: In a real app we might want to refresh the page or update state, 
      // but relying on server action revalidation or router.refresh() from parent
      // is common. However, since this is a client component, we might want imports.
      // Since deleteResourceAction likely calls revalidatePath, page refresh happens automatically via RSC.
      // But usually we need router.refresh() in client component if using useTransition? 
      // Wait, server actions alone don't refresh client router cache unless we call router.refresh() 
      // or return redirect.
      window.location.reload(); // Simple brute force for now, or use router.refresh()
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.message });
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-video w-full bg-muted flex items-center justify-center border-b overflow-hidden relative">
        {resource.imageUrl && !hasError ? (
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover transition-all hover:scale-105"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">Sem imagem</span>
          </div>
        )}
      </div>
      <CardHeader className="flex-none">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{resource.name}</CardTitle>
            <CardDescription>{resource.type} • {resource.location}</CardDescription>
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/dashboard/resources/edit/${resource.id}`}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 mt-auto">
        <Button asChild className="w-full">
          <Link href={`/dashboard/reservations/new?resourceId=${resource.id}`}>
            Reservar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
