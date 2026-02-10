
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
import { Logo } from "@/components/logo"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getUsers as getUsersAction } from '@/app/actions/data';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const users = await getUsersAction();
    const userExists = users.some(u => u.email === email);

    if (userExists) {
      toast({
        title: 'Verifique seu e-mail',
        description: 'Um código de redefinição de senha foi enviado para o seu e-mail (simulação).',
      });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O e-mail informado não foi encontrado em nosso sistema.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-8">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-bold">Esqueceu sua senha?</CardTitle>
          <CardDescription>
            Sem problemas. Insira seu e-mail e enviaremos um código de redefinição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Enviar Código de Redefinição
            </Button>
            <div className="mt-4 text-center text-sm">
              Lembrou sua senha?{' '}
              <Link href="/" className="underline">
                Voltar ao Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
