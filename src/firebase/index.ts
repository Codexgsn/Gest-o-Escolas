
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);
const auth = getAuth(app);

// Sign in anonymously to get a UID
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous sign-in failed:", error);
});

export { app, database, auth };
