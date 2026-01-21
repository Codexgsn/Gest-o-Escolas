'use client';

import AppSidebar from '@/components/app-sidebar';
import Header from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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
    <div className="flex min-h-screen w-full flex-row">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <div className="relative flex flex-1 flex-col items-center bg-background">
          <Header />
          <main className="w-full flex-1 p-4 sm:px-6 md:gap-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
