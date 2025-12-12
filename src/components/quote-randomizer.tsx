'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import {
  getRandomQuote,
  QuoteResult,
} from '@/app/actions/quote-randomizer-action';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { threwConfetti } from '@/lib/confetti';
import { useSettings } from '@/context/SettingsContext';

export default function QuoteRandomizer() {
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  const handleRandomize = async () => {
    sendGTMEvent({
      event: 'action_quote_randomizer',
      user_email: user ? user.email : 'guest',
    });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    try {
      const quoteResult = await getRandomQuote();
      setResult(quoteResult);
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

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `"${result.quote}" - ${result.author}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'Quote copied to clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Quote Randomizer</CardTitle>
        <CardDescription>
          Discover a random quote from a vast collection of over 1.6 million. <i>(credit : <a href="https://www.azquotes.com/" target="_blank">azquote.com</a>)</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px] flex items-center justify-center">
        {isLoading && (
          <div className="w-full space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-3/4" />
            <div className="pt-4 w-full relative">
              <Skeleton className="h-5 w-1/3 absolute right-0" />
            </div>
          </div>
        )}
        {!isLoading && result && (
          <div className="relative w-full p-4">
            <blockquote className="border-l-4 border-accent pl-6">
              <p className="text-xl md:text-2xl italic">"{result.quote}"</p>
            </blockquote>
            <div className="mt-4 flex justify-end items-center gap-2 text-lg">
              -
              <Link
                href={result.authorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                {result.author}
                <ExternalLink className="inline-block ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="absolute -top-2 -right-2">
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
          <p className="text-muted-foreground">
            Click the button to get a random quote.
          </p>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
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
            ? 'Finding a quote...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Quote'}
        </Button>
      </CardFooter>
    </Card>
  );
}
