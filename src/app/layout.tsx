import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FirebaseProvider } from '@/firebase/provider';
import { ThemeProvider } from '@/components/theme-provider'; // Importa o ThemeProvider

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
    // suppressHydrationWarning é usado para evitar erros de hidratação do lado do cliente.
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {/* 
          O ThemeProvider agora envolve todo o aplicativo, garantindo que o tema 
          seja gerenciado corretamente tanto no servidor quanto no cliente, 
          evitando erros de hidratação.
        */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <FirebaseProvider>
            {children}
          </FirebaseProvider>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
