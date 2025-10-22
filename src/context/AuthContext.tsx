// src/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useTheme } from "next-themes";
import {
  onAuthStateChanged,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
} from "@/lib/firebase-auth";
import { auth } from "@/lib/firebase-config";
import { getThemePreference } from "@/services/user-preferences";
import type { AuthContextType, AuthUser, FirebaseUser } from "@/types/auth";

// --- Dummy User for Development ---
const dummyUser: FirebaseUser = {
  uid: "dummy-user-uid-12345",
  email: "dev@randomizer.fun",
  displayName: "Dummy User",
  photoURL: "https://picsum.photos/seed/dummy-user/40/40",
  // Add other necessary fields with default values
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: "dummy",
  tenantId: null,
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve("dummy-token"),
  getIdTokenResult: () => Promise.resolve({} as any),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
};

// Nilai default untuk context
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  signInWithGoogle: () => Promise.reject("Not initialized"),
  signOut: () => Promise.reject("Not initialized"),
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function useAuth() {
  return useContext(AuthContext);
}

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
        const savedTheme = await getThemePreference(authUser.uid);
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } else {
        setTheme("system");
      }
      setUser(authUser);
      setLoading(false);
    },
    [setTheme],
  );

  useEffect(() => {
    // --- DEVELOPMENT MODE: Use Dummy User ---
    if (process.env.NODE_ENV === "development") {
      console.log("DEV MODE: Using dummy user.");
      // Use a timeout to simulate async loading
      const timer = setTimeout(() => {
         handleUserAuth(dummyUser);
      }, 500);
      return () => clearTimeout(timer);
    }

    // --- PRODUCTION MODE: Use Firebase Auth ---
    const unsubscribe = onAuthStateChanged(auth, handleUserAuth);
    return () => unsubscribe();
  }, [handleUserAuth]);

  // In development, the real auth functions are replaced with no-ops
  const isDevelopment = process.env.NODE_ENV === "development";
  
  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle: isDevelopment
      ? async () => {
          console.log("DEV MODE: signInWithGoogle is disabled.");
          return dummyUser;
        }
      : firebaseSignInWithGoogle,
    signOut: isDevelopment
      ? async () => {
          console.log("DEV MODE: signOut is disabled.");
        }
      : firebaseSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
