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
  const { toast } = useToast();
  const { user } = useAuth();

  const currentTrack = shuffledPlaylist[currentTrackIndex];

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
  }, [currentTrackIndex, shuffledPlaylist]); // Dependency array is important

  // Effect for playing/pausing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && currentTrack) {
      audio.play().catch(e => console.error("Playback failed:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Effect for changing volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load new track when index changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(currentTrack);
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
    }
  }, [currentTrack, isPlaying]);


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

  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % shuffledPlaylist.length);
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
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Select Music Files ({playlist.length} selected)
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6 min-h-[300px]">
          {/* Playlist */}
          <div className="space-y-2">
            <Label>Randomized Playlist</Label>
            <ScrollArea className="h-72 rounded-md border p-2 bg-muted/50">
              {shuffledPlaylist.length > 0 ? (
                shuffledPlaylist.map((file, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors hover:bg-accent/50",
                      index === currentTrackIndex && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setCurrentTrackIndex(index)}
                  >
                    <Music4 className="h-5 w-5" />
                    <span className="truncate flex-1">{file.name}</span>
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
                        <p className="font-semibold text-lg truncate max-w-xs">{currentTrack.name}</p>
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
    </Card>
  );
}

// Dummy CardFooter for consistent layout, but no global button needed here.
function ScrollArea({ className, children }: { className: string, children: React.ReactNode }) {
    return <div className={cn("overflow-y-auto", className)}>{children}</div>
}
