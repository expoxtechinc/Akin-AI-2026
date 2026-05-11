import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

console.log('Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use the standard getFirestore(app) which defaults to "(default)"
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

async function testConnection() {
  try {
    console.log('Testing Firebase connection with project:', firebaseConfig.projectId);
    // Try to get a doc - this will verify if we can reach the server
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    console.log('Firebase connected successfully');
  } catch (error: any) {
    console.group('Firebase Connection Diagnostic');
    console.error("Error Detail:", {
      message: error.message,
      code: error.code,
      name: error.name
    });

    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error("DIAGNOSTIC: The Firestore client is reporting as offline or unavailable.");
      console.error("POSSIBLE CAUSES:");
      console.error("1. Firestore is not enabled in project '" + firebaseConfig.projectId + "'.");
      console.error("2. The database '(default)' does not exist or is in Datastore mode.");
      console.error("3. Network/Proxy is blocking access to firestore.googleapis.com.");
      console.error("4. The API Key is restricted and doesn't allow access from this domain.");
    } else if (error.code === 'permission-denied') {
      console.error("DIAGNOSTIC: Permission Denied. This means the connection IS working, but your rules are blocking the test.");
      console.error("Check firestore.rules for the '/test/connection' match block.");
    } else {
      console.error("Firebase connection test failed with unexpected error:", error);
    }
    console.groupEnd();
  }
}

testConnection();

export { signInWithPopup, signOut };
