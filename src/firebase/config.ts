
// src/firebase/config.ts
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY || "build-placeholder-api-key",
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL || "https://your-project-id.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || "build-placeholder-sender-id",
  appId: process.env.NEXT_PUBLIC_APP_ID || "build-placeholder-app-id"
};
