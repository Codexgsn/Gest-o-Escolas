'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import Link from 'next/link';

export default function RegisterPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-8">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-bold">Criar uma Conta</CardTitle>
          <CardDescription>
            O registro de novas contas está temporariamente desativado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/" className="underline">
              Faça o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
