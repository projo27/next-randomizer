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
  getConfettiConfiguration,
  saveConfettiConfiguration,
} from "@/services/user-preferences";
import { ConfettiConfiguration } from "@/types/confetti";
import { useDebounce } from "@/hooks/use-debounce";

interface SettingsContextType {
  animationDuration: number;
  setAnimationDuration: (duration: number) => void;
  playSounds: boolean;
  setPlaySounds: (play: boolean) => void;
  visibleToolCount: number;
  setVisibleToolCount: (count: number) => void;
  confettiConfig: ConfettiConfiguration;
  setConfettiConfig: (config: ConfettiConfiguration) => void;
  loading: boolean;
}

const defaultContextValue: SettingsContextType = {
  animationDuration: 5,
  setAnimationDuration: () => { },
  playSounds: true,
  setPlaySounds: () => { },
  visibleToolCount: 10,
  setVisibleToolCount: () => { },
  confettiConfig: {
    enabled: true,
    particleCount: 100,
    spread: 70,
  },
  setConfettiConfig: () => { },
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
  const [confettiConfig, setConfettiConfig] = useState<ConfettiConfiguration>(
    defaultContextValue.confettiConfig,
  );
  const [loading, setLoading] = useState(true);

  const debouncedDuration = useDebounce(animationDuration, 500);
  const debouncedPlaySounds = useDebounce(playSounds, 500);
  const debouncedVisibleToolCount = useDebounce(visibleToolCount, 500);
  const debouncedConfettiConfig = useDebounce(confettiConfig, 500);

  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        setLoading(true);
        const [
          savedDuration,
          savedPlaySounds,
          savedVisibleToolCount,
          savedConfettiConfig,
        ] = await Promise.all([
          getAnimationDuration(user.uid),
          getPlaySounds(user.uid),
          getVisibleToolCount(user.uid),
          getConfettiConfiguration(user.uid),
        ]);

        setAnimationDuration(
          savedDuration ?? defaultContextValue.animationDuration,
        );
        setPlaySounds(savedPlaySounds ?? defaultContextValue.playSounds);
        setVisibleToolCount(
          savedVisibleToolCount ?? defaultContextValue.visibleToolCount,
        );
        setConfettiConfig(savedConfettiConfig ?? defaultContextValue.confettiConfig);
        setLoading(false);
      } else {
        // Reset to default when user logs out
        setAnimationDuration(defaultContextValue.animationDuration);
        setPlaySounds(defaultContextValue.playSounds);
        setVisibleToolCount(defaultContextValue.visibleToolCount);
        setConfettiConfig(defaultContextValue.confettiConfig);
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
      saveConfettiConfiguration(user.uid, debouncedConfettiConfig);
    }
  }, [debouncedConfettiConfig, user, loading]);

  const value = {
    animationDuration,
    setAnimationDuration,
    playSounds,
    setPlaySounds,
    visibleToolCount,
    setVisibleToolCount,
    confettiConfig,
    setConfettiConfig,
    loading: authLoading || loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
