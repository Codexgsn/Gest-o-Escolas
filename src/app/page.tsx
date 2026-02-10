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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { login } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';

// O conteúdo da página de login foi movido para este componente
function LoginPageContent() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(login, null);

  useEffect(() => {
    if (state?.success === false) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-8">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-bold">SchoolZenith</CardTitle>
          <CardDescription>
            Faça login para gerenciar os recursos da sua escola.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="SeuEmail@gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="SuaSenha"
              />
            </div>
            <LoginButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={pending}>
      {pending ? 'Entrando...' : 'Entrar'}
    </Button>
  );
}

// O componente principal agora aplica o guarda de autenticação
export default function LoginPage() {
  return (
    <LoginPageContent />
  );
}
