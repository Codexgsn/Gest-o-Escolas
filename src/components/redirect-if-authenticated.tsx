'use client';

import { useAppUser } from '@/hooks/use-app-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export default function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const { currentUser, isLoaded } = useAppUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until the user's authentication status is fully loaded.
    if (!isLoaded) {
      return;
    }

    // If the user is logged in, redirect them away from this page (e.g., the login page).
    if (currentUser) {
      router.replace('/dashboard');
    }
  }, [isLoaded, currentUser, router]);

  // While loading, or if the user is logged in (and a redirect is imminent),
  // show a loading screen instead of the page content.
  if (!isLoaded || currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  // If the user is not logged in, render the children (e.g., the login form).
  return <>{children}</>;
}
