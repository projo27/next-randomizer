'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, Radio, Play, Pause, ExternalLink, Globe, Heart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getCountries, getRandomStationByCountry, RadioStation, Country } from '@/services/radio-browser.ts';

function RadioPlayer({ station, onPlay, onPause }: { station: RadioStation, onPlay: () => void, onPause: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // When the station changes, pause the audio
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [station.stationuuid]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Set the source and play. This ensures it works on station change.
      audioRef.current.src = station.url_resolved;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div className="relative w-full text-center p-4 animate-fade-in space-y-4">
       <div className="relative h-32 w-32 mx-auto rounded-lg overflow-hidden bg-muted border-2 border-primary/50 shadow-lg flex items-center justify-center">
            {station.favicon ? (
                <Image
                src={station.favicon}
                alt={`${station.name} logo`}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            ) : (
                <Radio className="h-16 w-16 text-muted-foreground" />
            )}
        </div>
      <h3 className="text-2xl font-bold text-primary">{station.name}</h3>
      <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4"/>
          <span>{station.country} ({station.language})</span>
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Heart className="h-4 w-4 text-red-500" />
          <span>{station.votes}</span>
      </div>
      
      <audio 
        ref={audioRef}
        onPlay={() => { setIsPlaying(true); onPlay(); }}
        onPause={() => { setIsPlaying(false); onPause(); }}
        preload="none"
      >
        <source src={station.url_resolved} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="flex flex-wrap gap-2 justify-center pt-4">
        <Button onClick={togglePlay}>
          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        {station.homepage && (
          <Button asChild variant="outline">
            <Link href={station.homepage} target="_blank" rel="noopener noreferrer">
              Visit Homepage <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Separator({ orientation = 'horizontal', className = '' }: { orientation?: 'horizontal' | 'vertical', className?: string }) {
    return (
        <div
        className={`bg-border ${
            orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
        } ${className}`}
        />
    );
}

export default function RadioRandomizer() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [station, setStation] = useState<RadioStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch countries on initial component load
    async function loadCountries() {
      try {
        const countryList = await getCountries();
        setCountries(countryList);
      } catch (err) {
        console.error("Failed to load countries:", err);
        setError("Could not load the list of countries. Please refresh.");
      }
    }
    loadCountries();
  }, []);

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_radio_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setStation(null);

    try {
      const newStation = await getRandomStationByCountry(selectedCountry);
      if (newStation) {
        setStation(newStation);
      } else {
        setError("No playable stations found for the selected country. Please try another one.");
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
        <CardTitle>Radio Randomizer</CardTitle>
        <CardDescription>
          Discover random internet radio stations from around the world.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5 mx-auto">
          <Label htmlFor="country-select">Filter by Country</Label>
          <Select
            value={selectedCountry}
            onValueChange={setSelectedCountry}
            disabled={isLoading || isRateLimited || countries.length === 0}
          >
            <SelectTrigger id="country-select">
              <SelectValue placeholder="Select a Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.iso_3166_1} value={c.iso_3166_1}>
                  {c.name} ({c.stationcount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-[300px] flex items-center justify-center">
          {isLoading && (
            <div className="w-full max-w-sm mx-auto space-y-4">
              <Skeleton className="h-32 w-32 rounded-lg mx-auto" />
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <div className="flex justify-center gap-2 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          )}
          {!isLoading && station && (
             <RadioPlayer station={station} onPlay={() => {}} onPause={() => {}} />
          )}
          {!isLoading && !station && !error && (
            <div className="text-center text-muted-foreground p-4">
                <Radio className="h-16 w-16 mx-auto mb-4" />
                <p>Find your next favorite radio station!</p>
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
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Searching...' : isRateLimited ? 'Please wait...' : 'Randomize Station'}
        </Button>
      </CardFooter>
    </Card>
  );
}
