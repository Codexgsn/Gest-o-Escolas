'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/provider';
import { getUserById as getUserByIdAction } from '@/app/actions/data';
import type { User as AppUser } from '@/lib/data';

interface AppUserHookResult {
  currentUser: AppUser | null;
  isLoaded: boolean;
  error: Error | null;
}

export const useAppUser = (): AppUserHookResult => {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading, userError } = useUser();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isFirebaseUserLoading) {
      setIsLoaded(false);
      return;
    }

    if (userError) {
      setCurrentUser(null);
      setError(userError);
      setIsLoaded(true);
      return;
    }

    if (!firebaseUser) {
      setCurrentUser(null);
      setError(null);
      setIsLoaded(true);
      return;
    }

    let isCancelled = false;
    const fetchAppUser = async () => {
      try {
        // Use a stable value (UID) for fetching
        const appUser = await getUserByIdAction(firebaseUser.uid);
        if (!isCancelled) {
          if (appUser) {
            setCurrentUser(appUser);
            setError(null);
          } else {
            setCurrentUser(null);
            setError(new Error("User not found in application database."));
          }
        }
      } catch (e: any) {
        if (!isCancelled) {
          console.error("Failed to fetch app user", e);
          setCurrentUser(null);
          setError(e);
        }
      } finally {
        if (!isCancelled) {
          setIsLoaded(true);
        }
      }
    };

    fetchAppUser();

    return () => {
      isCancelled = true;
    };
  // Depend on the user's UID, which is stable, instead of the user object itself.
  // This prevents the infinite loop.
  }, [firebaseUser?.uid, isFirebaseUserLoading, userError]);

  return { currentUser, isLoaded, error };
};
