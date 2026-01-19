
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Correct import for Firestore
import { firebaseConfig } from "./config";

// This function ensures a single instance of Firebase is used across the app.
function createFirebaseApp() {
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

const firebaseApp = createFirebaseApp();
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp); // Use firestore

// Export the single, stable instances.
export { firebaseApp, auth, firestore };
