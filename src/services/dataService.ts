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

  // Conversations
  subscribeToConversations(userId: string, callback: (conversations: any[]) => void) {
    if (isNeuralMode(userId)) {
      const conversations = localStore.get(`conversations_${userId}`) || [];
      callback(conversations.sort((a: any, b: any) => b.updatedAt - a.updatedAt));
      return () => {};
    }
    const path = `users/${userId}/conversations`;
    const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(conversations);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback(localStore.get(`conversations_${userId}`) || []);
    });
  },

  async createConversation(userId: string, title: string = 'New Conversation') {
    const convId = Date.now().toString();
    const data = {
      id: convId,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (isNeuralMode(userId)) {
      const conversations = localStore.get(`conversations_${userId}`) || [];
      localStore.set(`conversations_${userId}`, [data, ...conversations]);
      return convId;
    }
    const path = `users/${userId}/conversations/${convId}`;
    try {
      await setDoc(doc(db, path), data);
      return convId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return convId;
    }
  },

  async updateConversation(userId: string, convId: string, data: any) {
    const updateData = { ...data, updatedAt: Date.now() };
    if (isNeuralMode(userId)) {
      const conversations = localStore.get(`conversations_${userId}`) || [];
      const index = conversations.findIndex((c: any) => c.id === convId);
      if (index !== -1) {
        conversations[index] = { ...conversations[index], ...updateData };
        localStore.set(`conversations_${userId}`, conversations);
      }
      return;
    }
    const path = `users/${userId}/conversations/${convId}`;
    try {
      await setDoc(doc(db, path), updateData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteConversation(userId: string, convId: string) {
    if (isNeuralMode(userId)) {
      const conversations = localStore.get(`conversations_${userId}`) || [];
      localStore.set(`conversations_${userId}`, conversations.filter((c: any) => c.id !== convId));
      return;
    }
    const path = `users/${userId}/conversations/${convId}`;
    try {
      // First delete messages subcollection
      const messagesPath = `${path}/messages`;
      const messagesSnap = await getDocs(collection(db, messagesPath));
      await Promise.all(messagesSnap.docs.map(d => deleteDoc(doc(db, messagesPath, d.id))));
      
      // Then delete conversation
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Messages (Modified for conversations)
  subscribeToMessages(userId: string, convId: string, callback: (messages: any[]) => void) {
    if (!convId) return () => {};
    if (isNeuralMode(userId)) {
      const messages = localStore.get(`messages_${userId}_${convId}`) || [];
      callback(messages);
      return () => {};
    }
    const path = `users/${userId}/conversations/${convId}/messages`;
    const q = query(collection(db, path), orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ ...doc.data() }));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback(localStore.get(`messages_${userId}_${convId}`) || []);
    });
  },

  async addMessage(userId: string, convId: string, message: any) {
    if (!convId) return;
    if (isNeuralMode(userId)) {
      const messages = localStore.get(`messages_${userId}_${convId}`) || [];
      localStore.set(`messages_${userId}_${convId}`, [...messages, message]);
      // Update conv timestamp
      const conversations = localStore.get(`conversations_${userId}`) || [];
      const index = conversations.findIndex((c: any) => c.id === convId);
      if (index !== -1) {
        conversations[index].updatedAt = Date.now();
        if (conversations[index].title === 'New Conversation' && message.role === 'user') {
          conversations[index].title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }
        localStore.set(`conversations_${userId}`, conversations);
      }
      return;
    }
    const path = `users/${userId}/conversations/${convId}/messages/${message.id}`;
    try {
      await setDoc(doc(db, path), message);
      // Update conv updatedAt
      await setDoc(doc(db, `users/${userId}/conversations/${convId}`), { 
        updatedAt: Date.now() 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
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
