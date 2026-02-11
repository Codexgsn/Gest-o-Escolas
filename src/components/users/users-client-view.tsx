
'use client';

import React, { useState, useEffect } from 'react';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Link from 'next/link';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { fetchUsers } from '@/lib/data';
import type { User } from '@/lib/definitions';

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
      case 'Admin': return 'default';
      case 'Usuário': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <TableRow data-state={isSelected ? 'selected' : ''}>
      <TableCell className="p-3 md:p-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(value) => onToggleSelect(user.id, !!value)}
          aria-label="Select row"
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2 md:gap-3">
          <Avatar className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
            <AvatarImage src={user.avatar || undefined} alt="Avatar" />
            <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5 min-w-0">
            <span className="font-medium truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={roleVariant(user.role)} className="text-xs">{user.role}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
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
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(user.id)}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export function UsersClientView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const allUsersData = await fetchUsers();
        setUsers(allUsersData);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    console.log("Deleting user:", userId);
    alert("Funcionalidade de exclusão de usuário ainda não implementada.");
  };

  const handleDeleteMultiple = async () => {
    console.log("Deleting users:", selectedUserIds);
    alert("Funcionalidade de exclusão de múltiplos usuários ainda não implementada.");
    setSelectedUserIds([]);
  };

  const handleToggleSelect = (userId: string, selected: boolean) => {
    setSelectedUserIds((prev) => selected ? [...prev, userId] : prev.filter((id) => id !== userId));
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedUserIds(selected ? users.map((u) => u.id) : []);
  };

  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  const numSelected = selectedUserIds.length;
  const rowCount = users.length;

  return (
    <Card>
      <CardHeader className="px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg md:text-xl">Gerenciamento de Usuários</CardTitle>
            <CardDescription className="text-sm">Gerencie todos os usuários, seus papéis e permissões.</CardDescription>
          </div>
          {numSelected > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="w-full sm:w-auto">Excluir ({numSelected})</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação excluirá permanentemente os {numSelected} usuários selecionados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMultiple}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0 md:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="p-3 md:p-4 w-[50px]">
                  <Checkbox
                    checked={rowCount > 0 && numSelected === rowCount}
                    onCheckedChange={(value) => handleSelectAll(!!value)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">Usuário</TableHead>
                <TableHead className="min-w-[100px]">Papel</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Criado em</TableHead>
                <TableHead className="w-[70px]"><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDeleteUser}
                    isSelected={selectedUserIds.includes(user.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center">Nenhum usuário encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
