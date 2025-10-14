"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getAnimationDuration,
  saveAnimationDuration,
} from "@/services/user-preferences";
import { useDebounce } from "@/hooks/use-debounce";

interface SettingsContextType {
  animationDuration: number;
  setAnimationDuration: (duration: number) => void;
  loading: boolean;
}

const defaultContextValue: SettingsContextType = {
  animationDuration: 5,
  setAnimationDuration: () => {},
  loading: true,
};

const SettingsContext = createContext<SettingsContextType>(defaultContextValue);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [animationDuration, setAnimationDuration] = useState(
    defaultContextValue.animationDuration,
  );
  const [loading, setLoading] = useState(true);

  // Debounce the duration value to avoid too many writes to Firestore
  const debouncedDuration = useDebounce(animationDuration, 1000);

  // Effect to fetch initial settings when user logs in
  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        setLoading(true);
        const savedDuration = await getAnimationDuration(user.uid);
        if (savedDuration !== null) {
          setAnimationDuration(savedDuration);
        }
        setLoading(false);
      } else {
        // Reset to default when user logs out
        setAnimationDuration(defaultContextValue.animationDuration);
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  // Effect to save debounced settings to Firestore
  useEffect(() => {
    if (user && !loading && debouncedDuration !== null) {
      saveAnimationDuration(user.uid, debouncedDuration);
    }
  }, [debouncedDuration, user, loading]);

  const value = {
    animationDuration,
    setAnimationDuration,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
