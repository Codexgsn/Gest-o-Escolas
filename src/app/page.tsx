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
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { login } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';

// O conteúdo da página de login foi movido para este componente
function LoginPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useFormState(login, null);
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('LoginPageContent state changed:', state);
    if (state?.success === false) {
      console.log('Triggering error toast:', state.message);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: state.message,
      });
    } else if (state?.success === true && !hasRedirected.current) {
      console.log('Triggering success toast:', state.message);
      hasRedirected.current = true;
      toast({
        title: "Sucesso",
        description: state.message,
      });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  }, [state, toast, router]);

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
              <PasswordInput
                id="password"
                name="password"
                required
                placeholder="SuaSenha"
              />
            </div>
            {state?.success === false && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md animate-in fade-in slide-in-from-top-1">
                {state.message || "Erro desconhecido. Tente novamente."}
              </div>
            )}
            <LoginButton />
          </form>
        </CardContent>
      </Card>
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 p-2 bg-black/80 text-white text-[10px] rounded pointer-events-none z-50">
          State: {JSON.stringify(state)}
        </div>
      )}
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
