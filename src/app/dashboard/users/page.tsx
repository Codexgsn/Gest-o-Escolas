
'use client';

import Link from 'next/link';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  deleteUserAction,
  deleteMultipleUsersAction,
} from '@/app/actions/users';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { database } from '@/firebase';
import { ref, onValue } from 'firebase/database';


function UserRow({
  user,
  onDelete,
  isSelected,
  onToggleSelect,
}: {
  user: User;
  onDelete: (userId: string) => void;
  isSelected: boolean;
  onToggleSelect: (userId: string, selected: boolean) => void;
}) {
  const roleVariant = (role: User['role']) => {
    switch (role) {
      case 'Admin':
        return 'default';
      case 'Usuário':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <TableRow data-state={isSelected ? 'selected' : ''}>
      <TableCell className="p-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(value) => onToggleSelect(user.id, !!value)}
          aria-label="Select row"
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.avatar}
              alt="Avatar"
            />
            <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">5</TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date().toLocaleDateString()}
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
                <Link href={`/dashboard/users/edit/${user.id}`}>Editar</Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Ver Reservas</DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive">
                  Excluir
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o
                usuário.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(user.id)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

function UsersTable({ 
  users,
  onUserDeleted,
  onMultipleUsersDeleted 
}: { 
  users: User[],
  onUserDeleted: (id: string) => void,
  onMultipleUsersDeleted: (ids: string[]) => void
}) {
  const { toast } = useToast();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id ?? null;

  const handleToggleSelect = (userId: string, selected: boolean) => {
    setSelectedUserIds((prev) =>
      selected ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedUserIds(selected ? users.map((u) => u.id) : []);
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUserAction(userId, currentUserId);

    if (result.success) {
      toast({
        title: 'Usuário Excluído',
        description: result.message,
      });
      onUserDeleted(userId);
      setSelectedUserIds([]);
    } else {
      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMultiple = async () => {
    const result = await deleteMultipleUsersAction(selectedUserIds, currentUserId);

    if (result.success) {
      toast({
        title: 'Usuários Excluídos',
        description: result.message,
      });
      onMultipleUsersDeleted(selectedUserIds);
      setSelectedUserIds([]);
    } else {
      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const numSelected = selectedUserIds.length;
  const rowCount = users.length;
  
  if (!users.length) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                Gerencie todos os usuários, seus papéis e permissões.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Nenhum usuário encontrado no banco de dados.</p>
                </div>
            </CardContent>
        </Card>
     )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>
              Gerencie todos os usuários, seus papéis e permissões.
            </CardDescription>
          </div>
          {numSelected > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Excluir ({numSelected})</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente os {numSelected} usuários selecionados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMultiple}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-4">
                <Checkbox
                  checked={rowCount > 0 && numSelected === rowCount}
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  onCheckedChange={(value) => handleSelectAll(!!value)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead className="hidden md:table-cell">Reservas</TableHead>
              <TableHead className="hidden md:table-cell">Criado em</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onDelete={handleDeleteUser}
                isSelected={selectedUserIds.includes(user.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


function UsersPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-2">
                            <Skeleton className="h-6 w-6" />
                            <div className="flex-1 flex items-center space-x-4">
                               <Skeleton className="h-10 w-10 rounded-full" />
                               <div className="flex-1 space-y-2">
                                  <Skeleton className="h-4 w-1/2" />
                                   <Skeleton className="h-3 w-1/3" />
                               </div>
                            </div>
                             <div className="flex-1">
                                <Skeleton className="h-4 w-1/4" />
                             </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const usersRef = ref(database, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setUsers(userList);
            } else {
                setUsers([]);
            }
            setIsLoading(false);
        }, (error) => {
            console.error(error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUserDeleted = (deletedUserId: string) => {
        // The real-time listener will handle the update automatically
    };

    const handleMultipleUsersDeleted = (deletedUserIds: string[]) => {
       // The real-time listener will handle the update automatically
    };

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
                    <BreadcrumbPage>Usuários</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
                <div className="ml-auto flex items-center gap-2">
                <Button asChild size="sm" className="h-8 gap-1">
                    <Link href="/dashboard/users/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Adicionar Usuário
                    </span>
                    </Link>
                </Button>
                </div>
            </div>
            {isLoading ? (
                <UsersPageSkeleton />
            ) : (
                <UsersTable 
                    users={users} 
                    onUserDeleted={handleUserDeleted}
                    onMultipleUsersDeleted={handleMultipleUsersDeleted}
                />
            )}
        </>
    );
}
