"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useSettings } from "./SettingsContext";

interface RandomizerAudioContextType {
  playAudio: () => void;
  stopAudio: () => void;
}

const RandomizerAudioContext = createContext<
  RandomizerAudioContextType | undefined
>(undefined);

export function useRandomizerAudio() {
  const context = useContext(RandomizerAudioContext);
  if (!context) {
    throw new Error(
      "useRandomizerAudio must be used within a RandomizerAudioProvider",
    );
  }
  return context;
}

export function RandomizerAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { playSounds } = useSettings(); // Get the sound setting

  useEffect(() => {
    // Initialize audio only on the client side
    audioRef.current = new Audio("/musics/randomize-synth.mp3");

    // Cleanup function to pause and reset audio when the provider unmounts
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const playAudio = useCallback(() => {
    // Only play audio if the setting is enabled
    if (!playSounds) return;

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0; // Rewind to the start
      audio.play().catch((error) => {
        // This error can happen if the user hasn't interacted with the page yet.
        // It's generally safe to ignore in this context as the play is triggered by a user click.
        if(process.env.NODE_ENV !== "production") console.warn("Audio play was prevented:", error.name);
      });
    }
  }, [playSounds]); // Add playSounds as a dependency

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const value = { playAudio, stopAudio };

  return (
    <RandomizerAudioContext.Provider value={value}>
      {children}
    </RandomizerAudioContext.Provider>
  );
}
