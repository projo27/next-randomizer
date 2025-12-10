// src/context/SettingsContext.tsx
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
  getVisibleToolCount,
  saveVisibleToolCount,
  getConfettiEnabled,
  saveConfettiEnabled,
} from "@/services/user-preferences";
import { useDebounce } from "@/hooks/use-debounce";

interface SettingsContextType {
  animationDuration: number;
  setAnimationDuration: (duration: number) => void;
  playSounds: boolean;
  setPlaySounds: (play: boolean) => void;
  visibleToolCount: number;
  setVisibleToolCount: (count: number) => void;
  confettiEnabled: boolean;
  setConfettiEnabled: (enabled: boolean) => void;
  loading: boolean;
}

const defaultContextValue: SettingsContextType = {
  animationDuration: 5,
  setAnimationDuration: () => { },
  playSounds: true,
  setPlaySounds: () => { },
  visibleToolCount: 10,
  setVisibleToolCount: () => { },
  confettiEnabled: true,
  setConfettiEnabled: () => { },
  loading: true,
};

const SettingsContext = createContext<SettingsContextType>(defaultContextValue);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [animationDuration, setAnimationDuration] = useState(
    defaultContextValue.animationDuration,
  );
  const [playSounds, setPlaySounds] = useState(defaultContextValue.playSounds);
  const [visibleToolCount, setVisibleToolCount] = useState(
    defaultContextValue.visibleToolCount,
  );
  const [confettiEnabled, setConfettiEnabled] = useState(
    defaultContextValue.confettiEnabled,
  );
  const [loading, setLoading] = useState(true);

  const debouncedDuration = useDebounce(animationDuration, 500);
  const debouncedPlaySounds = useDebounce(playSounds, 500);
  const debouncedVisibleToolCount = useDebounce(visibleToolCount, 500);
  const debouncedConfettiEnabled = useDebounce(confettiEnabled, 500);

  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        setLoading(true);
        const [
          savedDuration,
          savedPlaySounds,
          savedVisibleToolCount,
          savedConfettiEnabled,
        ] = await Promise.all([
          getAnimationDuration(user.uid),
          getPlaySounds(user.uid),
          getVisibleToolCount(user.uid),
          getConfettiEnabled(user.uid),
        ]);

        setAnimationDuration(
          savedDuration ?? defaultContextValue.animationDuration,
        );
        setPlaySounds(savedPlaySounds ?? defaultContextValue.playSounds);
        setVisibleToolCount(
          savedVisibleToolCount ?? defaultContextValue.visibleToolCount,
        );
        setConfettiEnabled(savedConfettiEnabled ?? defaultContextValue.confettiEnabled);
        setLoading(false);
      } else {
        // Reset to default when user logs out
        setAnimationDuration(defaultContextValue.animationDuration);
        setPlaySounds(defaultContextValue.playSounds);
        setVisibleToolCount(defaultContextValue.visibleToolCount);
        setConfettiEnabled(defaultContextValue.confettiEnabled);
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchSettings();
    }
  }, [user, authLoading]);

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

  useEffect(() => {
    if (user && !loading) {
      saveVisibleToolCount(user.uid, debouncedVisibleToolCount);
    }
  }, [debouncedVisibleToolCount, user, loading]);

  useEffect(() => {
    if (user && !loading) {
      saveConfettiEnabled(user.uid, debouncedConfettiEnabled);
    }
  }, [debouncedConfettiEnabled, user, loading]);

  const value = {
    animationDuration,
    setAnimationDuration,
    playSounds,
    setPlaySounds,
    visibleToolCount,
    setVisibleToolCount,
    confettiEnabled,
    setConfettiEnabled,
    loading: authLoading || loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
