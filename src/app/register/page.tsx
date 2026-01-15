
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpenCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createUserAction } from '@/app/actions/users';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro de Cadastro",
        description: "As senhas não coincidem.",
      });
      return;
    }
    
    if (password.length < 8) {
        toast({
            variant: "destructive",
            title: "Senha muito curta",
            description: "A senha deve ter pelo menos 8 caracteres.",
        });
        return;
    }

    // In a real app, a default "User" role would be assigned.
    // The admin ID for creating users is null because it's a public registration.
    const result = await createUserAction({
        name,
        email,
        password,
        role: 'Usuário',
        avatar: '' // Let the backend assign a default
    }, null); // No admin is creating this user.

    if (result.success) {
      toast({
        title: "Cadastro Realizado com Sucesso!",
        description: "Você já pode fazer login com suas novas credenciais.",
      });
      router.push('/');
    } else {
      toast({
        variant: "destructive",
        title: "Falha no Cadastro",
        description: result.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <BookOpenCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Criar uma Conta</CardTitle>
          <CardDescription>
            Junte-se à plataforma SchoolZenith para gerenciar seus recursos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="João da Silva"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="SeuEmail@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Crie uma senha forte (mínimo 8 caracteres)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Cadastrar
            </Button>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
              <Link href="/" className="underline">
                Faça o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
