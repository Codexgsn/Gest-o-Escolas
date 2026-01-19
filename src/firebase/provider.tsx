'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

// Import the stable, singleton Firebase instances directly.
// This is the key to preventing re-initialization and infinite loops.
import { firebaseApp, auth, firestore } from './client';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// The provider no longer needs props for the instances.
interface FirebaseProviderProps {
  children: ReactNode;
}

// ... (interfaces for context state and hook results remain the same)

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  // useEffect now depends on the stable, imported `auth` instance.
  // It will run once and subscribe to auth state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, // Use the stable instance
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // The dependency array is empty because `auth` is a stable import.

  // useMemo also depends on the stable instances and the user auth state.
  // It creates a stable context value that only changes when auth state changes.
  const contextValue = useMemo((): FirebaseContextState => ({
    areServicesAvailable: !!(firebaseApp && firestore && auth),
    firebaseApp,
    firestore,
    auth,
    user: userAuthState.user,
    isUserLoading: userAuthState.isUserLoading,
    userError: userAuthState.userError,
  }), [userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

// The rest of the hooks (useFirebase, useUser, etc.) remain the same.
// They will now receive the stable context value and will not trigger infinite re-renders.

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return useMemo(() => {
    if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
      throw new Error('Firebase core services not available. Check FirebaseProvider setup.');
    }

    return {
      firebaseApp: context.firebaseApp,
      firestore: context.firestore,
      auth: context.auth,
      user: context.user,
      isUserLoading: context.isUserLoading,
      userError: context.userError,
    };
  }, [context]);
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  
  return useMemo(() => ({
    user,
    isUserLoading,
    userError
  }), [user, isUserLoading, userError]);
};