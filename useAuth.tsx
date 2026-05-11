import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios for credentials
const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data.user;
        setUser({
          ...userData,
          photoURL: userData.photoURL || null
        });
      } catch (error) {
        // User not logged in, ignore
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Sync with independent server
      const response = await api.post('/auth/firebase-sync', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      });
      
      const userData = response.data.user;
      setUser({
        ...userData,
        photoURL: userData.photoURL || null
      });
    } catch (error: any) {
      console.error("Google Login error:", error);
      throw error;
    }
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data.user;
      setUser({
        ...userData,
        photoURL: userData.photoURL || null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const userData = response.data.user;
      setUser({
        ...userData,
        photoURL: userData.photoURL || null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
