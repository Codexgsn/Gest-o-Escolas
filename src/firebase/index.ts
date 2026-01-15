
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { firebaseConfig } from './config';

// Main interface for Firebase services
interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  database: Database; // Added Realtime Database
}

/**
 * Initializes and returns the Firebase services.
 * It ensures that Firebase is initialized only once.
 */
export function initializeFirebase(): FirebaseServices {
  const apps = getApps();
  const firebaseApp = !apps.length ? initializeApp(firebaseConfig) : getApp();
  
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const database = getDatabase(firebaseApp); // Initialize Realtime Database

  return { firebaseApp, auth, firestore, database };
}

// Export the initialized services directly for simple imports elsewhere
const { firebaseApp, auth, firestore, database } = initializeFirebase();
export { firebaseApp, auth, firestore, database };

// Barrel file for exporting all provider hooks and components
export { FirebaseClientProvider } from './client-provider';
export { useFirebase, useAuth, useFirestore, useFirebaseApp, useUser } from './provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
