'use client';

import { useState } from 'react';
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
import {
  Wand2,
  Music,
  User,
  Album,
  Calendar,
  PenSquare,
  ExternalLink,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomMusic, MusicResult } from '@/app/actions/music-randomizer-action';

function SpotifyIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
        <path d="M7.682 15.862c-.277.48.133.99.645.815 3.036-1.03 6.09-1.28 8.91-.772.48.08.81-.33.6-.743-3.41-6.3-9.5-5.34-10.155.7z" />
        <path d="M7.14 12.822c-.29.504.15.93.684.735 2.76-1.02 5.76-1.23 8.4-.62.51.12.85-.33.63-.78-3.03-6.2-8.25-5.6-9.714.665z" />
        <path d="M6.91 9.942c-.277.447.19.825.615.63 2.5-1.125 5.25-1.215 7.5-.42.48.165.795-.27.57-.69-2.655-5.04-7.245-4.5-8.685.48z" />
      </svg>
    );
}

function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 6 4.5 4 7 4h10c2.5 0 4.5 2 4.5 4v10c0 2-2 4-4.5 4H7c-2.5 0-4.5-2-4.5-4z" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    )
}

export default function MusicRandomizer() {
  const [result, setResult] = useState<MusicResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({
      event: 'action_music_randomizer',
      user_email: user?.email ?? 'guest',
    });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const musicResult = await getRandomMusic();
      setResult(musicResult);
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
        <CardTitle>Music Randomizer</CardTitle>
        <CardDescription>
          Discover a random song from the vast MusicBrainz database.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex items-center justify-center">
        {isLoading && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full mt-4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        )}
        {!isLoading && result && (
          <div className="w-full grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-6 animate-fade-in">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
              {result.coverArtUrl ? (
                <Image
                  src={result.coverArtUrl}
                  alt={`Cover art for ${result.album}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <Album className="h-16 w-16" />
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl lg:text-3xl font-bold text-primary">{result.title}</h3>
              <div className="space-y-3 text-sm text-card-foreground/90">
                <p className="flex items-center gap-3"><User className="h-4 w-4 text-accent" /> {result.artist}</p>
                <p className="flex items-center gap-3"><Album className="h-4 w-4 text-accent" /> {result.album || 'N/A'}</p>
                {result.releaseDate && <p className="flex items-center gap-3"><Calendar className="h-4 w-4 text-accent" /> Released on {result.releaseDate}</p>}
                {result.composers.length > 0 && <p className="flex items-center gap-3"><PenSquare className="h-4 w-4 text-accent" /> Composed by {result.composers.join(', ')}</p>}
              </div>
              <div className="flex flex-wrap gap-2 pt-4">
                {result.spotifyUrl && (
                    <Button asChild variant="outline">
                        <Link href={result.spotifyUrl} target='_blank' rel='noopener noreferrer'>
                            <SpotifyIcon className='mr-2'/>
                            Find on Spotify
                        </Link>
                    </Button>
                )}
                {result.youtubeUrl && (
                     <Button asChild variant="outline">
                        <Link href={result.youtubeUrl} target='_blank' rel='noopener noreferrer'>
                            <YouTubeIcon className='mr-2'/>
                            Find on YouTube
                        </Link>
                    </Button>
                )}
              </div>
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
          <div className="text-center text-muted-foreground p-4">
            <Music className="h-16 w-16 mx-auto mb-4" />
            <p>Click the button to discover a random song.</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Oops!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading
            ? 'Searching for music...'
            : isRateLimited
            ? 'Please wait...'
            : 'Randomize Music'}
        </Button>
      </CardFooter>
    </Card>
  );
}
