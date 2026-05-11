import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  onSnapshot
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

// Local Storage Fallback for Neural Identity Mode
const isNeuralMode = (userId: string) => userId.startsWith('neural_');

const localStore = {
  get: (key: string) => JSON.parse(localStorage.getItem(`akinai_${key}`) || 'null'),
  set: (key: string, val: any) => localStorage.setItem(`akinai_${key}`, JSON.stringify(val)),
};

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
  console.warn('Firestore Operation Redirected or Failed:', errInfo.error);
  // We swallow the error and rely on the fact that UI will use whatever data we return (or we could throw if we want strict mode)
}

export const dataService = {
  // User Profile
  async getUserProfile(userId: string) {
    if (isNeuralMode(userId)) {
      return localStore.get(`profile_${userId}`);
    }
    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return localStore.get(`profile_${userId}`);
    }
  },

  async setUserProfile(userId: string, data: any) {
    if (isNeuralMode(userId)) {
      localStore.set(`profile_${userId}`, { ...data, updatedAt: new Date().toISOString() });
      return;
    }
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, path), { ...data, updatedAt: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      localStore.set(`profile_${userId}`, { ...data, updatedAt: new Date().toISOString() });
    }
  },

  // Tasks
  subscribeToTasks(userId: string, callback: (tasks: any[]) => void) {
    if (isNeuralMode(userId)) {
      const tasks = localStore.get(`tasks_${userId}`) || [];
      callback(tasks.sort((a: any, b: any) => b.createdAt - a.createdAt));
      return () => {};
    }
    
    const path = `users/${userId}/tasks`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      const tasks = localStore.get(`tasks_${userId}`) || [];
      callback(tasks);
    });
  },

  async addTask(userId: string, task: any) {
    const taskData = { ...task, createdAt: Date.now() };
    if (isNeuralMode(userId)) {
      const tasks = localStore.get(`tasks_${userId}`) || [];
      localStore.set(`tasks_${userId}`, [taskData, ...tasks]);
      return;
    }
    const path = `users/${userId}/tasks/${task.id}`;
    try {
      await setDoc(doc(db, path), taskData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      const tasks = localStore.get(`tasks_${userId}`) || [];
      localStore.set(`tasks_${userId}`, [taskData, ...tasks]);
    }
  },

  async updateTask(userId: string, task: any) {
    if (isNeuralMode(userId)) {
      const tasks = localStore.get(`tasks_${userId}`) || [];
      const index = tasks.findIndex((t: any) => t.id === task.id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...task };
        localStore.set(`tasks_${userId}`, tasks);
      }
      return;
    }
    const path = `users/${userId}/tasks/${task.id}`;
    try {
      await setDoc(doc(db, path), task, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteTask(userId: string, taskId: string) {
    if (isNeuralMode(userId)) {
      const tasks = localStore.get(`tasks_${userId}`) || [];
      localStore.set(`tasks_${userId}`, tasks.filter((t: any) => t.id !== taskId));
      return;
    }
    const path = `users/${userId}/tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Messages
  subscribeToMessages(userId: string, callback: (messages: any[]) => void) {
    if (isNeuralMode(userId)) {
      const messages = localStore.get(`messages_${userId}`) || [];
      callback(messages);
      return () => {};
    }
    const path = `users/${userId}/messages`;
    const q = query(collection(db, path), orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ ...doc.data() }));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback(localStore.get(`messages_${userId}`) || []);
    });
  },

  async addMessage(userId: string, message: any) {
    if (isNeuralMode(userId)) {
      const messages = localStore.get(`messages_${userId}`) || [];
      localStore.set(`messages_${userId}`, [...messages, message]);
      return;
    }
    const path = `users/${userId}/messages/${message.id}`;
    try {
      await setDoc(doc(db, path), message);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      const messages = localStore.get(`messages_${userId}`) || [];
      localStore.set(`messages_${userId}`, [...messages, message]);
    }
  },
  
  async clearMessages(userId: string) {
    if (isNeuralMode(userId)) {
      localStore.set(`messages_${userId}`, []);
      return;
    }
    const path = `users/${userId}/messages`;
    try {
      const snapshot = await getDocs(collection(db, path));
      const deletions = snapshot.docs.map(d => deleteDoc(doc(db, path, d.id)));
      await Promise.all(deletions);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      localStore.set(`messages_${userId}`, []);
    }
  }
};
