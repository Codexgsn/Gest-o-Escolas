// This file now acts as a central export point for the stable, client-side Firebase instances.
// By re-exporting from client.ts, we ensure that any part of the app importing from '@/firebase'
// gets the memoized, singleton instances, preventing the infinite re-render loop.

export { firebaseApp, auth, firestore } from './client';
