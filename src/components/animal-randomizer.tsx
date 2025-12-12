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
import { Wand2, PawPrint, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomAnimal, AnimalResult } from '@/app/actions/animal-randomizer-action';
import { Badge } from './ui/badge';
import { threwConfetti } from '@/lib/confetti';
import { useSettings } from '@/context/SettingsContext';

export default function AnimalRandomizer() {
  const [result, setResult] = useState<AnimalResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5000); // Longer timeout for scraping
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_animal_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const animalResult = await getRandomAnimal();
      setResult(animalResult);
      if (confettiConfig.enabled) {
        threwConfetti({
          particleCount: confettiConfig.particleCount,
          spread: confettiConfig.spread,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. The website structure may have changed.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Wildlife Animal Randomizer</CardTitle>
        <CardDescription>
          Discover a random animal from the World Wildlife Fund species list. <i>Powered by World Wildlife Fund</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex flex-col items-center justify-center">
        {isLoading && (
          <div className="w-full space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-full mt-4" />
            </div>
          </div>
        )}
        {!isLoading && result && (
          <div className="w-full animate-fade-in space-y-4">
            <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
              <Image
                src={result.imageUrl}
                alt={result.name}
                fill
                className="object-cover"
                unoptimized // External images might not be optimizable
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-primary">{result.name}</h3>
              <p className="text-sm text-muted-foreground italic">{result.scientificName}</p>
              {result.status && <Badge variant="destructive">{result.status}</Badge>}
              <p className="text-card-foreground/90 pt-2 text-left">
                {result.description}
              </p>
              <Button asChild>
                <Link href={result.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Read more on WWF <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
          <div className="text-center text-muted-foreground p-4">
            <PawPrint className="h-16 w-16 mx-auto mb-4" />
            <p>Click the button to discover a random animal.</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Oops! An Error Occurred</AlertTitle>
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
            ? 'Exploring the wild...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Animal'}
        </Button>
      </CardFooter>
    </Card>
  );
}
