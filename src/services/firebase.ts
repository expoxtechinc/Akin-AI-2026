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
    // Attempt standard connection
    const testDoc = doc(db, 'test', 'connection');
    await getDocFromServer(testDoc);
    console.log('Neural Cloud Sync: Active');
  } catch (error: any) {
    // If cloud is unavailable, we rely on the Neural Identity fallback implemented in dataService
    console.log('Neural Node: Running in Isolated Mode (Local Persistence Active)');
    
    if (error.code === 'permission-denied') {
      console.warn('Cloud Sync: Access restricted by security rules.');
    }
  }
}

testConnection();

export { signInWithPopup, signOut };
