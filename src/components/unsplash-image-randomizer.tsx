'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Download, Expand, Minimize, User, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomUnsplashImage, UnsplashResult } from '@/app/actions/unsplash-randomizer-action';
import { cn } from '@/lib/utils';

export default function UnsplashImageRandomizer() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<UnsplashResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5000);
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_unsplash_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const imageResult = await getRandomUnsplashImage(query);
      setResult(imageResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleFullscreen = () => {
    if (!imageContainerRef.current) return;
    if (!document.fullscreenElement) {
      imageContainerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Unsplash Image Randomizer</CardTitle>
        <CardDescription>
          Get a random high-quality image from Unsplash based on your search query.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="search-query">Search Query (e.g., "nature", "city")</Label>
          <Input
            id="search-query"
            type="text"
            placeholder="Default: wallpaper"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading || isRateLimited}
          />
        </div>

        <div 
          ref={imageContainerRef}
          className={cn(
            "relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden transition-colors",
            isFullscreen && "bg-black"
          )}
        >
          {isLoading && <Skeleton className="h-full w-full" />}
          {!isLoading && result && (
            <>
              <Image
                src={result.imageUrl}
                alt={result.alt}
                fill
                className="object-cover animate-fade-in"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-2 rounded-md">
                Photo by <Link href={result.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">{result.photographerName}</Link> on <Link href="https://unsplash.com/?utm_source=randomizer.fun&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Unsplash</Link>
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="outline" size="icon" onClick={() => window.open(result.downloadUrl, '_blank')}>
                    <Download className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleToggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
                </Button>
              </div>
            </>
          )}
          {!isLoading && !result && !error && (
            <p className="text-muted-foreground">Your random image will appear here.</p>
          )}
           {error && !isLoading && (
            <Alert variant="destructive" className="m-4">
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
          {isLoading ? 'Finding Image...' : isRateLimited ? 'Please wait...' : 'Randomize Image'}
        </Button>
      </CardFooter>
    </Card>
  );
}
