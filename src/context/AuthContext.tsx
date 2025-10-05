'use client'; // Harus di client side

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useTheme } from 'next-themes';
import {
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
} from '@/lib/firebase-auth';
import { auth } from '@/lib/firebase-config';
import { getThemePreference } from '@/services/user-preferences';
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
  const { setTheme } = useTheme();

  const handleUserAuth = useCallback(
    async (authUser: AuthUser) => {
      if (authUser) {
        console.log(authUser)
        // User logged in, try to fetch their theme
        const savedTheme = await getThemePreference(authUser.uid);
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } else {
        // User logged out, revert to system theme
        setTheme('system');
      }
      setUser(authUser);
      setLoading(false);
    },
    [setTheme],
  );

  useEffect(() => {
    // Mengamati perubahan status autentikasi
    const unsubscribe = onAuthStateChanged(auth, handleUserAuth);

    // Cleanup: Membersihkan observer
    return () => unsubscribe();
  }, [handleUserAuth]);

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle, // Implementasi fungsi dari auth.ts
    signOut, // Implementasi fungsi dari auth.ts
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}