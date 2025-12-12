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
import { Wand2, FlaskConical, Link as LinkIcon, Youtube, BrainCircuit } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { generateScienceFact, ScienceFactOutput } from '@/ai/flows/science-fact-flow';
import { Badge } from './ui/badge';
import { threwConfetti } from '@/lib/confetti';
import { useSettings } from '@/context/SettingsContext';

export default function ScienceFactRandomizer() {
  const [result, setResult] = useState<ScienceFactOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5000);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  const handleRandomize = async () => {
    sendGTMEvent({
      event: 'action_science_fact_randomizer',
      user_email: user?.email ?? 'guest',
    });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const factResult = await generateScienceFact();
      setResult(factResult);
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
        <CardTitle>AI Science Fact Randomizer</CardTitle>
        <CardDescription>
          Get a random, interesting science fact along with sources to learn more. <i>Powered by Gemini</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
        {isLoading && (
          <div className="w-full space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
            <div className="pt-6 space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        )}
        {!isLoading && result && (
          <div className="w-full animate-fade-in space-y-6 p-4 rounded-lg bg-card/50 border">
            <blockquote className="border-l-4 border-accent pl-4">
              <p className="text-xl md:text-2xl font-semibold italic">"{result.fact}"</p>
            </blockquote>
            <div className='space-y-3'>
              <h4 className='font-semibold'>Learn More:</h4>
              <div className='flex flex-col sm:flex-row gap-2'>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={result.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Read Source Article
                  </Link>
                </Button>
                {result.youtubeUrl && (
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={result.youtubeUrl} target="_blank" rel="noopener noreferrer">
                      <Youtube className="mr-2 h-4 w-4" />
                      Watch on YouTube
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
          <div className="text-center text-muted-foreground p-4">
            <FlaskConical className="h-16 w-16 mx-auto mb-4" />
            <p>Click the button to discover a fascinating science fact.</p>
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
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isLoading
            ? 'Thinking of a fact...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Science Fact'}
        </Button>
      </CardFooter>
    </Card>
  );
}
