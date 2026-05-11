import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dataService = {
  // User Profile
  async getUserProfile(userId: string) {
    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async setUserProfile(userId: string, data: any) {
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, path), { ...data, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Tasks
  subscribeToTasks(userId: string, callback: (tasks: any[]) => void) {
    const path = `users/${userId}/tasks`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async addTask(userId: string, task: any) {
    const path = `users/${userId}/tasks/${task.id}`;
    try {
      await setDoc(doc(db, path), { ...task, createdAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateTask(userId: string, task: any) {
    const path = `users/${userId}/tasks/${task.id}`;
    try {
      await setDoc(doc(db, path), task, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteTask(userId: string, taskId: string) {
    const path = `users/${userId}/tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Messages
  subscribeToMessages(userId: string, callback: (messages: any[]) => void) {
    const path = `users/${userId}/messages`;
    const q = query(collection(db, path), orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ ...doc.data() }));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async addMessage(userId: string, message: any) {
    const path = `users/${userId}/messages/${message.id}`;
    try {
      await setDoc(doc(db, path), message);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },
  
  async clearMessages(userId: string) {
    const path = `users/${userId}/messages`;
    try {
      const snapshot = await getDocs(collection(db, path));
      const deletions = snapshot.docs.map(d => deleteDoc(doc(db, path, d.id)));
      await Promise.all(deletions);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
