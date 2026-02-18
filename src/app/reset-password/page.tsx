
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Logo } from "@/components/logo"
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { resetPasswordAction } from '@/app/actions/users';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'As senhas não coincidem.',
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

    // In a real app, you would verify the code first.
    // For this simulation, we'll just attempt to reset the password.
    const result = await resetPasswordAction({ email, password });


    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: 'Sua senha foi redefinida. Você já pode fazer o login.',
      });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro na Redefinição',
        description: result.message,
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
          <CardTitle className="text-3xl font-bold">Redefinir sua Senha</CardTitle>
          <CardDescription>
            Digite o código enviado para <strong>{email}</strong> (simulação, qualquer código serve) e crie uma nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                placeholder="123456"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <PasswordInput
                id="password"
                placeholder="Nova senha (mínimo 8 caracteres)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirme a nova senha"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Redefinir Senha
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
