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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { login } from '@/app/actions/auth';

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <BookOpenCheck className="h-12 w-12 text-primary" />
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
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{' '}
              <Link href="/register" className="underline">
                Cadastre-se
              </Link>
            </div>
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
