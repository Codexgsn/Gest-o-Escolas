import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

// Importações do Firebase
import { FirebaseProvider } from '@/firebase/provider';
// As instâncias agora são gerenciadas internamente pelo provider e pelo client.ts
// Não precisamos mais importá-las e passá-las aqui.

export const metadata: Metadata = {
  title: 'Gestão Escolar',
  description: 'Gerenciamento de recursos para instituições de ensino.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {/* 
          O FirebaseProvider agora obtém as instâncias estáveis de auth, firestore, etc., 
          diretamente do contexto que é alimentado pela inicialização única em client.ts.
          Remover os props aqui quebra o ciclo de recriação de instâncias no lado do servidor.
        */}
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
