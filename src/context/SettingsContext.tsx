"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getAnimationDuration,
  saveAnimationDuration,
  getPlaySounds,
  savePlaySounds,
} from "@/services/user-preferences";
import { useDebounce } from "@/hooks/use-debounce";

interface SettingsContextType {
  animationDuration: number;
  setAnimationDuration: (duration: number) => void;
  playSounds: boolean;
  setPlaySounds: (play: boolean) => void;
  loading: boolean;
}

const defaultContextValue: SettingsContextType = {
  animationDuration: 5,
  setAnimationDuration: () => {},
  playSounds: true,
  setPlaySounds: () => {},
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
  const [playSounds, setPlaySounds] = useState(defaultContextValue.playSounds);
  const [loading, setLoading] = useState(true);

  const debouncedDuration = useDebounce(animationDuration, 500);
  const debouncedPlaySounds = useDebounce(playSounds, 500);

  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        setLoading(true);
        const [savedDuration, savedPlaySounds] = await Promise.all([
          getAnimationDuration(user.uid),
          getPlaySounds(user.uid),
        ]);

        if (savedDuration !== null) {
          setAnimationDuration(savedDuration);
        }
        if (savedPlaySounds !== null) {
          setPlaySounds(savedPlaySounds);
        }
        setLoading(false);
      } else {
        // Reset to default when user logs out
        setAnimationDuration(defaultContextValue.animationDuration);
        setPlaySounds(defaultContextValue.playSounds);
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  useEffect(() => {
    if (user && !loading) {
      saveAnimationDuration(user.uid, debouncedDuration);
    }
  }, [debouncedDuration, user, loading]);

  useEffect(() => {
    if (user && !loading) {
      savePlaySounds(user.uid, debouncedPlaySounds);
    }
  }, [debouncedPlaySounds, user, loading]);

  const value = {
    animationDuration,
    setAnimationDuration,
    playSounds,
    setPlaySounds,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
