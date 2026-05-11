import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>; // Kept for interface compatibility but points to modal trigger
  signUpCustom: (email: string, name: string) => Promise<void>;
  signInCustom: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for local session
    let savedUser = localStorage.getItem('akinai_neural_user');
    
    if (!savedUser) {
      // Auto-provision user on first visit to bypass friction
      const defaultUser: User = {
        uid: `neural_${Math.random().toString(36).substr(2, 9)}`,
        email: 'guest@neural.akin',
        displayName: 'Neural Operator',
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=AkinAI`,
      };
      localStorage.setItem('akinai_neural_user', JSON.stringify(defaultUser));
      savedUser = JSON.stringify(defaultUser);
    }
    
    setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const signIn = async () => {
    // This will be handled by the UI
    console.log('Initiating Neural Auth UI');
  };

  const signUpCustom = async (email: string, name: string) => {
    const newUser: User = {
      uid: `neural_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };
    
    // Simulate neural sync latency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    localStorage.setItem('akinai_neural_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signInCustom = async (email: string) => {
    const savedUser = localStorage.getItem('akinai_neural_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.email === email) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setUser(parsed);
        return;
      }
    }
    throw new Error('Neural Signature not found in local cache');
  };

  const logout = async () => {
    localStorage.removeItem('akinai_neural_user');
    const defaultUser: User = {
      uid: `neural_${Math.random().toString(36).substr(2, 9)}`,
      email: 'guest@neural.akin',
      displayName: 'Neural Operator',
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=AkinAI`,
    };
    localStorage.setItem('akinai_neural_user', JSON.stringify(defaultUser));
    setUser(defaultUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUpCustom, signInCustom, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
