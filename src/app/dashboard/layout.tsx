
'use client';

import AppSidebar from '@/components/app-sidebar';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth'; // Corrected import path
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth(); // Using the standardized hook
  const router = useRouter();

  useEffect(() => {
    // If the auth state is not loading and there is no user, redirect to login.
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show a loading skeleton while the auth state is being determined.
  if (loading || !user) {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
          <Skeleton className="h-16 w-16 rounded-full mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
       </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-row">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <div className="relative flex flex-1 flex-col items-center bg-background">
              <Header />
              <main className="w-full flex-1 p-4 sm:px-6 md:gap-8">{children}</main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
