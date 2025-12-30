'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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

import { PresetManager } from './preset-manager';
import { Play, Pause } from 'lucide-react';
import { Slider } from './ui/slider';

export default function UnsplashImageRandomizer() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<UnsplashResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(60000);
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Image Transition State
  const [activeResult, setActiveResult] = useState<UnsplashResult | null>(null);
  const [isNewImageReady, setIsNewImageReady] = useState(false);

  // Auto Play State
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayDuration, setAutoPlayDuration] = useState(1); // seconds
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleRandomize = useCallback(async (searchQuery?: string) => {
    const finalQuery = searchQuery ?? query;
    sendGTMEvent({ event: 'action_unsplash_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    // Do not clear result immediately if auto-playing to prevent flicker? Actually standard behavior is fine.
    // setResult(null); 

    try {
      const imageResult = await getRandomUnsplashImage(finalQuery);
      setResult(imageResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
      setIsAutoPlaying(false); // Stop auto play on error
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, isRateLimited, triggerRateLimit, user]);

  // Effect for Auto Play
  useEffect(() => {
    if (isAutoPlaying) {
      // Clear existing interval to restart timer if duration changes or play is toggled
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);

      autoPlayIntervalRef.current = setInterval(() => {
        handleRandomize();
      }, autoPlayDuration * 60 * 1000);
    } else {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    }

    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, [isAutoPlaying, autoPlayDuration, handleRandomize]);

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

  const toggleAutoPlay = () => {
    if (!isAutoPlaying) {
      handleRandomize(); // Start immediately
    }
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Unsplash Image Randomizer</CardTitle>
        <CardDescription className="flex flex-col gap-2">
          <span className="mt-4"> Get a random high-quality image from Unsplash based on your search query. <i>Powered by <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">Unsplash API</a></i></span>
          <span className="text-muted-foreground text-xs mb-4">Because of the rate limit from Unsplash API, the randomizer is only available for maximum 1 request per minute. It helps others to get random images from Unsplash too.</span>
          <PresetManager
            toolId="unsplash-randomizer"
            currentParams={{ query, autoPlayDuration }}
            onLoadPreset={(params: any) => {
              if (params.query) setQuery(params.query);
              if (params.autoPlayDuration) setAutoPlayDuration(params.autoPlayDuration);
            }}
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="search-query">Search Query (e.g., "nature", "city")</Label>
          <Input
            id="search-query"
            type="text"
            placeholder="eg. wallpaper"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading || isRateLimited || isAutoPlaying}
          />
        </div>

        <div
          ref={imageContainerRef}
          className={cn(
            "relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden group",
            isFullscreen && "bg-black"
          )}
        >
          {isLoading && !result && !activeResult && <Skeleton className="h-full w-full" />}

          {/* Background Layer (Previous Image) */}
          {activeResult && activeResult !== result && (
            <div className="absolute inset-0 z-0">
              <Image
                src={isFullscreen ? activeResult.fullImageUrl : activeResult.imageUrl}
                alt={activeResult.alt}
                fill
                className={cn("object-cover", isFullscreen && "object-contain")}
                priority
              />
            </div>
          )}

          {/* Foreground Layer (New Image) */}
          {result && (
            <div className={cn("absolute inset-0 z-10 transition-opacity duration-1000",
              // If it's the same image, full opacity. If it's a new image, start at 0 until loaded?
              // Actually, we need a state to trigger the fade-in.
              // Let's rely on the onLoad of the Image to trigger opacity.
              // But we need to distinguish "newly mounted" vs "loaded".
              (!activeResult || result === activeResult || isNewImageReady) ? "opacity-100" : "opacity-0"
            )}>
              <Image
                src={isFullscreen ? result.fullImageUrl : result.imageUrl}
                alt={result.alt}
                fill
                onLoad={() => {
                  // When the NEW image loads:
                  if (result !== activeResult) {
                    // Trigger fade in
                    setIsNewImageReady(true);
                    // After transition, commit the change
                    setTimeout(() => {
                      setActiveResult(result);
                      setIsNewImageReady(false);
                    }, 1000); // Match duration
                  }
                }}
                priority
              />
              <div className={cn("absolute bottom-2 left-2 bg-black/50 text-white text-xs p-2 rounded-md transition-opacity duration-300", isFullscreen && "opacity-0 group-hover:opacity-100")}>
                Photo by <Link href={result.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">{result.photographerName}</Link> on <Link href="https://unsplash.com/?utm_source=randomizer.fun&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Unsplash</Link>
              </div>
              <div className={cn("absolute top-2 right-2 flex gap-2 transition-opacity duration-300", isFullscreen && "opacity-0 group-hover:opacity-100")}>
                <Button variant="secondary" size="icon" onClick={toggleAutoPlay} className="bg-black/50 text-white hover:bg-black/70 border-none">
                  {isAutoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="secondary" size="icon" onClick={() => window.open(result.downloadUrl, '_blank')} className="bg-black/50 text-white hover:bg-black/70 border-none">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="secondary" size="icon" onClick={handleToggleFullscreen} className="bg-black/50 text-white hover:bg-black/70 border-none">
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !result && !activeResult && !error && (
            <p className="text-muted-foreground z-20 relative">Your random image will appear here.</p>
          )}
          {error && !isLoading && (
            <Alert variant="destructive" className="m-4 z-20 relative">
              <AlertTitle>Oops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <Label className="w-32">Auto Play <span className='text-xs text-muted-foreground ml-2'>({autoPlayDuration}m)</span></Label>
            <Slider
              value={[autoPlayDuration]}
              min={1}
              max={60}
              step={1}
              onValueChange={(vals) => setAutoPlayDuration(vals[0])}
              disabled={isAutoPlaying}
              className="w-56 md:w-1/2"
              title="We are sorry, but we are not able to provide images faster than 1 minutes."
            />
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant={isAutoPlaying ? "destructive" : "default"}
                onClick={toggleAutoPlay}
                disabled={isLoading && !isAutoPlaying} // Allow stopping even if loading
              >
                {isAutoPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isAutoPlaying ? "Stop Auto Play" : "Start Auto Play"}
              </Button>
            </div>
          </div>

        </div>
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={() => handleRandomize()}
          disabled={isLoading || isRateLimited || isAutoPlaying}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Finding Image...' : isRateLimited ? 'Please wait...' : 'Randomize Image'}
        </Button>
      </CardFooter>
    </Card>
  );
}
