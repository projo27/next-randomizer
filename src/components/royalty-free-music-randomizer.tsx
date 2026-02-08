'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { threwConfetti } from '@/lib/confetti';
import { getRandomMusicTrack, MusicSource, MusicTrack } from '@/services/free-music-service';
import { sendGTMEvent } from '@next/third-parties/google';
import {
  ExternalLink,
  Music,
  Pause,
  Play,
  RotateCw,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Skeleton } from './ui/skeleton';
import { Slider } from './ui/slider';

function MusicPlayer({ track }: { track: MusicTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      jamendo: 'Jamendo',
      freesound: 'Freesound',
      fma: 'Free Music Archive',
    };
    return labels[source] || source;
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        {/* Cover Art */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {track.coverArtUrl ? (
            <Image
              src={track.coverArtUrl}
              alt={`Cover art for ${track.title}`}
              fill
              className="object-cover"
            />
          ) : (
            <Music className="h-16 w-16 text-muted-foreground" />
          )}
        </div>

        {/* Track Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-primary">{track.title}</h3>
            <p className="text-lg text-muted-foreground">{track.artist}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Source: {getSourceLabel(track.source)}
            </p>
          </div>

          {/* Audio Element */}
          <audio ref={audioRef} src={track.audioUrl} preload="metadata" />

          {/* Play/Pause Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlay}
              size="lg"
              className="bg-accent hover:bg-accent/90"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Time */}
            <div className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="flex items-center gap-2">
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                Volume
              </Label>
            </div>
            <Slider
              value={[volume * 100]}
              onValueChange={(value) => setVolume(value[0] / 100)}
              max={100}
              step={1}
              className="w-full max-w-xs"
            />
          </div>

          {/* Loop Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={isLooping ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsLooping(!isLooping)}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Loop
            </Button>
          </div>

          {/* Credits */}
          {track.licenseUrl && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                {track.license || 'Creative Commons'}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={track.licenseUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View License & Credits
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoyaltyFreeMusicRandomizer() {
  const [track, setTrack] = useState<MusicTrack | null>(null);
  const [musicSource, setMusicSource] = useState<MusicSource>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5000);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  const handleRandomize = async () => {
    sendGTMEvent({
      event: 'action_music_randomizer',
      user_email: user?.email ?? 'guest',
      music_source: musicSource,
    });

    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setTrack(null);

    try {
      const musicTrack = await getRandomMusicTrack(musicSource);
      setTrack(musicTrack);
      if (confettiConfig.enabled) {
        threwConfetti({
          particleCount: confettiConfig.particleCount,
          spread: confettiConfig.spread,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Royalty Free Music Randomizer</CardTitle>
        <CardDescription>
          Discover random royalty-free music from Jamendo, Freesound, and Free Music Archive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Music Source Selector */}
        <div className="grid w-full max-w-xs items-center gap-1.5">
          <Label htmlFor="music-source">Music Source</Label>
          <Select
            value={musicSource}
            onValueChange={(value) => setMusicSource(value as MusicSource)}
            disabled={isLoading || isRateLimited}
          >
            <SelectTrigger id="music-source">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="jamendo">Jamendo</SelectItem>
              <SelectItem value="freesound">Freesound</SelectItem>
              <SelectItem value="fma">Free Music Archive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Player Area */}
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
          {isLoading && (
            <div className="w-full grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 animate-fade-in">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-8 w-full max-w-xs" />
              </div>
            </div>
          )}

          {!isLoading && track && <MusicPlayer track={track} />}

          {!isLoading && !track && !error && (
            <div className="text-center text-muted-foreground p-4">
              <Music className="h-16 w-16 mx-auto mb-4" />
              <p>Click the button to discover royalty-free music.</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Oops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading
            ? 'Finding music...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Music'}
        </Button>
      </CardFooter>
    </Card>
  );
}
