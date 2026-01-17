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
import Link from 'next/link';

// Importações do Firebase, da autenticação e do novo guarda
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "@/firebase"; 
import RedirectIfAuthenticated from '@/components/redirect-if-authenticated';

const auth = getAuth(firebaseApp);

// O conteúdo da página de login foi movido para este componente
function LoginPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login bem-sucedido!",
        description: `Redirecionando para o painel...`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login Error:", error.code, error.message);
      let title = "Falha no Login";
      let description = "Ocorreu um erro inesperado. Tente novamente.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-email':
        case 'auth/invalid-credential':
          description = "Email ou senha incorretos.";
          break;
        case 'auth/network-request-failed':
          description = "Erro de rede. Verifique sua conexão e tente novamente.";
          break;
        case 'auth/too-many-requests':
          description = "Acesso temporariamente bloqueado devido a muitas tentativas. Tente novamente mais tarde.";
          break;
      }
      toast({
        variant: "destructive",
        title: title,
        description: description,
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
          <CardTitle className="text-3xl font-bold">SchoolZenith</CardTitle>
          <CardDescription>
            Faça login para gerenciar os recursos da sua escola.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
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
                type="password" 
                required 
                value={password}
                placeholder="SuaSenha"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Entrar
            </Button>
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

// O componente principal agora aplica o guarda de autenticação
export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <LoginPageContent />
    </RedirectIfAuthenticated>
  );
}
