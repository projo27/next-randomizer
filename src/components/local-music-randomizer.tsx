// src/components/local-music-randomizer.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Upload,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
  Music4,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import ScrollerText from './ui/scroller-text';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function LocalMusicRandomizer() {
  const [playlist, setPlaylist] = useState<File[]>([]);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<File[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const currentTrack = shuffledPlaylist[currentTrackIndex];

  const handleNext = useCallback(() => {
    // Pick a random index that is not the current one (unless it's the only track)
    if (shuffledPlaylist.length <= 1) return;

    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * shuffledPlaylist.length);
    } while (nextIndex === currentTrackIndex && shuffledPlaylist.length > 1);

    setCurrentTrackIndex(nextIndex);
  }, [shuffledPlaylist.length, currentTrackIndex]);

  // Effect for handling audio playback and events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleTrackEnd = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [handleNext]);

  // Helper for safe playback
  const safePlay = (audio: HTMLAudioElement) => {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Ignore AbortError which happens when skipping tracks quickly
        if (error.name !== 'AbortError') {
          console.error("Playback failed:", error);
        }
      });
    }
  };

  // Effect for playing/pausing (toggling state)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (audio.paused) {
        safePlay(audio);
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Effect for changing volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load new track when index changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      // Pause current track before switching to prevent some conflicts
      audioRef.current.pause();
      audioRef.current.src = URL.createObjectURL(currentTrack);
      if (isPlaying) {
        safePlay(audioRef.current);
      }
    }
  }, [currentTrack]); // Removed isPlaying dependency to avoid redundant calls


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    sendGTMEvent({ event: "action_local_music_upload", user_email: user?.email ?? "guest" });
    const files = event.target.files;
    if (files && files.length > 0) {
      const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));

      if (audioFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "No audio files selected",
          description: "Please select valid audio files (e.g., MP3, WAV, OGG).",
        });
        return;
      }

      setPlaylist(audioFiles);
      const newShuffledPlaylist = shuffleArray(audioFiles);
      setShuffledPlaylist(newShuffledPlaylist);
      setCurrentTrackIndex(0);
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      toast({
        title: "Playlist loaded!",
        description: `Added ${audioFiles.length} songs and shuffled the playlist.`,
      });
    }
  };

  const handleAddFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    sendGTMEvent({ event: "action_local_music_add", user_email: user?.email ?? "guest" });
    const files = event.target.files;
    if (files && files.length > 0) {
      const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));

      if (audioFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "No audio files selected",
          description: "Please select valid audio files (e.g., MP3, WAV, OGG).",
        });
        return;
      }

      const newPlaylist = [...playlist, ...audioFiles];
      setPlaylist(newPlaylist);
      // We also add to shuffled playlist, but maybe we want to reshuffle everything or just append?
      // User likely wants to hear new songs too. Let's just append then maybe user can hit random?
      // Per request "next seharusnya merandom", so just appending is fine, handleNext will pick from it.
      // But let's shuffle only the new ones and append for "randomness" in list view if that matters?
      // Actually simply appending to both lists is easiest and effective since next is random.

      setShuffledPlaylist(prev => [...prev, ...audioFiles]);

      toast({
        title: "Music added!",
        description: `Added ${audioFiles.length} songs to the playlist.`,
      });
    }
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length);
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <Card className="w-full shadow-lg border-none">
      <audio ref={audioRef} />
      <CardHeader>
        <CardTitle>Local Music Randomizer</CardTitle>
        <CardDescription>
          Select audio files from your computer to create and play a random playlist. Your files are not uploaded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Input
          ref={fileInputRef}
          id="music-files"
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 w-full">
          <Input
            ref={addFileInputRef}
            id="add-music-files"
            type="file"
            multiple
            accept="audio/*"
            onChange={handleAddFileChange}
            className="hidden"
          />
          <Button onClick={() => addFileInputRef.current?.click()} variant="secondary" className="hover:bg-accent">
            <Upload className="mr-2 h-4 w-4" />
            Add Music
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Replace Playlist
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 min-h-[300px] w-full">
          {/* Playlist */}
          <div className="space-y-2 w-full min-w-0">
            <Label>Randomized Playlist</Label>
            <ScrollArea className="h-72 rounded-md border p-2 bg-muted/50">
              {shuffledPlaylist.length > 0 ? (
                shuffledPlaylist.map((file, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-row items-center gap-3 p-2 mb-1 rounded-md cursor-pointer transition-colors hover:bg-accent/50",
                      index === currentTrackIndex && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setCurrentTrackIndex(index)}
                  >
                    <Music4 className="h-5 w-5 shrink-0" />
                    <ScrollerText text={file.name} className="flex-1 text-sm font-medium" />
                    {index === currentTrackIndex && isPlaying && <Volume2 className="h-4 w-4 animate-pulse" />}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ListMusic className="h-8 w-8 mb-2" />
                  <p className="text-sm text-center">Your playlist is empty.</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Player */}
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50">
            {currentTrack ? (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Now Playing</p>
                  <ScrollerText text={currentTrack.name} className="font-semibold text-lg w-full max-w-xs mx-auto" />
                </div>

                {/* Progress Bar */}
                <div className="w-full space-y-2 mb-4">
                  <Slider
                    value={[progress]}
                    max={duration}
                    onValueChange={(value) => handleSeek(value[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handlePrev}>
                    <SkipBack />
                  </Button>
                  <Button size="lg" className="rounded-full h-16 w-16" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNext}>
                    <SkipForward />
                  </Button>
                </div>

                {/* Volume */}
                <div className="w-full max-w-xs flex items-center gap-2 mt-6">
                  <VolumeIcon className="h-5 w-5 text-muted-foreground cursor-pointer" onClick={() => setVolume(volume > 0 ? 0 : 0.8)} />
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(value) => setVolume(value[0] / 100)}
                  />
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <Music4 className="h-12 w-12 mx-auto mb-4" />
                <p>Select some music to start playing.</p>
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card >
  );
}
