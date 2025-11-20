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
import { Wand2, Landmark, Calendar, Check, Copy, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getTodaysHistoricalEvent } from '@/app/actions/historical-event-action';
import type { HistoricalEvent } from '@/app/actions/historical-event-action';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function HistoricalEventRandomizer() {
  const [result, setResult] = useState<HistoricalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_historical_event', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;
    
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    try {
      const eventResult = await getTodaysHistoricalEvent();
      setResult(eventResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${result.year}: ${result.description}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'Historical event copied to clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>On This Day in History</CardTitle>
        <CardDescription>
          Discover a random historical event that happened today. Powered by Wikipedia.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
        {isLoading && (
          <div className="w-full space-y-4 p-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-8 w-full mt-2" />
            <Skeleton className="h-8 w-5/6" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
          </div>
        )}
        {!isLoading && result && (
          <div className="relative w-full animate-fade-in space-y-4 p-4 rounded-lg bg-card/50 border">
            <p className="text-sm font-semibold text-primary flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {result.year}
            </p>
            <p className="text-lg md:text-xl text-card-foreground">
              {result.description}
            </p>
            {result.links && result.links.length > 0 && (
                 <div className="flex flex-wrap gap-2 pt-2">
                    {result.links.map((link, index) => (
                        <Button key={index} asChild variant="outline" size="sm">
                            <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {link.title}
                            </Link>
                        </Button>
                    ))}
                 </div>
            )}
            <div className="absolute -top-2 right-0">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
          <div className="text-center text-muted-foreground p-4">
              <Landmark className="h-16 w-16 mx-auto mb-4" />
              <p>Click the button to find out what happened on this day in history.</p>
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
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading
            ? 'Searching history...'
            : isRateLimited
              ? 'Please wait...'
              : 'What Happened Today?'}
        </Button>
      </CardFooter>
    </Card>
  );
}
