"use client";

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
import { Wand2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import {
  getRandomMeme,
  MemeResult,
} from '@/app/actions/meme-randomizer-action';
import { threwConfetti } from '@/lib/confetti';
import { useSettings } from '@/context/SettingsContext';

export default function MemeRandomizer() {
  const [result, setResult] = useState<MemeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(2000);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  const handleRandomize = async () => {
    sendGTMEvent({
      event: 'action_meme_randomizer',
      user_email: user?.email ?? 'guest',
    });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);

    try {
      const memeResult = await getRandomMeme();
      setResult(memeResult);
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
        <CardTitle>Meme Randomizer</CardTitle>
        <CardDescription>
          Get a random meme from the internet, powered by Giphy.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] flex items-center justify-center">
        {isLoading && (
          <div className="w-full space-y-4">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-64 w-full mt-4" />
          </div>
        )}
        {!isLoading && result && (
          <div className="relative w-full text-center p-4 animate-fade-in space-y-4">
            <h3 className="text-xl font-bold text-primary mb-2">
              {result.title}
            </h3>
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden">
              <Image
                src={result.imageUrl}
                alt={result.title || 'Random Meme'}
                fill
                className="object-contain rounded-lg"
                unoptimized // Gifs can be large, unoptimized is better here
              />
            </div>
            <Button asChild variant="link">
              <Link href={result.sourceUrl} target="_blank" rel="noopener noreferrer">
                View on Giphy <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
        {!isLoading && !result && !error && (
          <p className="text-muted-foreground">
            Click the button to get a random meme.
          </p>
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
          id="randomize-button"
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading
            ? 'Finding Meme...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Meme'}
        </Button>
      </CardFooter>
    </Card>
  );
}
