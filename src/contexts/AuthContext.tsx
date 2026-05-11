import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, googleProvider, auth, signOut } from '../services/firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUpCustom: (email: string, name: string) => Promise<void>;
  signInCustom: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for Google Auth changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        setLoading(false);
      } else {
        // 2. Fallback to Local Neural Identity if no Google Session
        try {
          const savedUser = localStorage.getItem('akinai_neural_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            // Provision guest
            const guest: User = {
              uid: `neural_${Math.random().toString(36).substr(2, 9)}`,
              email: 'guest@neural.akin',
              displayName: 'Guest Operator',
              photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=AkinAI`,
            };
            localStorage.setItem('akinai_neural_user', JSON.stringify(guest));
            setUser(guest);
          }
        } catch (e) {
          console.error('LocalStorage Auth Error:', e);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign In Error:', error);
      throw error;
    }
  };

  const signUpCustom = async (email: string, name: string) => {
    const newUser: User = {
      uid: `neural_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };
    localStorage.setItem('akinai_neural_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signInCustom = async (email: string) => {
    const guest: User = {
      uid: `neural_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName: email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    localStorage.setItem('akinai_neural_user', JSON.stringify(guest));
    setUser(guest);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('akinai_neural_user');
      window.location.reload();
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUpCustom, signInCustom, logout }}>
      {children}
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
