'use client';

import { useAuth } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export default function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const { currentUser, isUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && currentUser) {
      router.replace('/dashboard');
    }
  }, [isUserLoading, currentUser, router]);

  if (isUserLoading || currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  return <>{children}</>;
}
