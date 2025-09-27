'use client'; // Harus di client side

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
} from '@/lib/firebase-auth';
import { auth } from '@/lib/firebase-config';
import { AuthContextType, AuthUser } from '@/types/auth';

// Nilai default untuk context
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  // Placeholder fungsi, akan diganti dengan implementasi asli
  signInWithGoogle: () => Promise.reject('Not initialized'),
  signOut: () => Promise.reject('Not initialized'),
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Custom Hook untuk mempermudah penggunaan
export function useAuth() {
  return useContext(AuthContext);
}

// Interface untuk props AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Mengamati perubahan status autentikasi
    const unsubscribe = onAuthStateChanged(
      auth,
      (authUser: React.SetStateAction<AuthUser>) => {
        // authUser otomatis bertipe User | null
        setUser(authUser);
        setLoading(false);
      },
    );

    // Cleanup: Membersihkan observer
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle, // Implementasi fungsi dari auth.ts
    signOut, // Implementasi fungsi dari auth.ts
  };

  // Tampilkan loading screen/spinner jika masih dalam proses pengecekan status
  // if (loading) {
  //   return <div>Loading Authentication...</div>;
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
