
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
            <AvatarImage src={user.avatar || undefined} alt="Avatar" />
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
      <TableCell className="hidden md:table-cell">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Gerencie todos os usuários, seus papéis e permissões.</CardDescription>
          </div>
          {numSelected > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive">Excluir ({numSelected})</Button></AlertDialogTrigger>
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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-4">
                <Checkbox
                  checked={rowCount > 0 && numSelected === rowCount}
                  // indeterminate prop not supported by Shadcn Checkbox directly, usually handled by ref or separate state if needed
                  // but standard HTML checkbox supports it via ref. 
                  // For now, let's just ignore visual indeterminate state or check if we can pass "data-state"
                  onCheckedChange={(value) => handleSelectAll(!!value)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead className="hidden md:table-cell">Criado em</TableHead>
              <TableHead><span className="sr-only">Ações</span></TableHead>
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
      </CardContent>
    </Card>
  );
}
