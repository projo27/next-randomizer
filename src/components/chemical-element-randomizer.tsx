// src/components/chemical-element-randomizer.tsx
'use client';

import { useState } from 'react';
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
import { Wand2, FlaskConical, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomChemicalElement } from '@/app/actions/chemical-element-randomizer-action';
import type { ChemicalElement } from '@/lib/chemical-elements-data';
import { threwConfetti } from '@/lib/confetti';
import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

function ElementCard({ element }: { element: ChemicalElement }) {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in space-y-4">
      <div 
        className="relative p-4 rounded-lg shadow-inner border-2"
        style={{ borderColor: element.color, background: `${element.color}20` }}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-start">
            <span className="text-2xl font-bold">{element.atomicNumber}</span>
            <span className="text-5xl font-extrabold">{element.symbol}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm">{element.atomicMass.toFixed(3)}</span>
            <span className="text-xl font-semibold capitalize">{element.name}</span>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-muted-foreground">{element.electronConfiguration}</div>
      </div>
      <Card className="bg-card/50">
        <CardContent className="pt-6 space-y-4">
          <p className="italic">{element.summary}</p>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong className="text-muted-foreground">Category:</strong> <span className="capitalize">{element.category.replace('-', ' ')}</span></div>
            <div><strong className="text-muted-foreground">Phase:</strong> {element.phase}</div>
            <div><strong className="text-muted-foreground">Discovered by:</strong> {element.discovered_by}</div>
            {element.appearance && <div><strong className="text-muted-foreground">Appearance:</strong> <span className="capitalize">{element.appearance}</span></div>}
          </div>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href={element.source} target="_blank" rel="noopener noreferrer">
                Read more on Wikipedia <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChemicalElementRandomizer() {
  const [result, setResult] = useState<ChemicalElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_chemical_element_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const elementResult = await getRandomChemicalElement();
      setResult(elementResult);
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
        <CardTitle>Chemical Element Randomizer</CardTitle>
        <CardDescription>
          Discover a random element from the periodic table and learn about its properties.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex flex-col items-center justify-center">
        {isLoading && (
          <div className="w-full max-w-md mx-auto space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {!isLoading && result && <ElementCard element={result} />}
        {!isLoading && !result && !error && (
          <div className="text-center text-muted-foreground p-4">
            <FlaskConical className="h-16 w-16 mx-auto mb-4" />
            <p>Click the button to discover a random chemical element.</p>
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
            ? 'Searching the elements...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Element'}
        </Button>
      </CardFooter>
    </Card>
  );
}
