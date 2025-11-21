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
import { Wand2, Feather, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomPoem, PoetryResult } from '@/app/actions/poetry-randomizer-action';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export default function PoetryRandomizer() {
  const [result, setResult] = useState<PoetryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(2000);
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_poetry_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;
    
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    try {
      const poemResult = await getRandomPoem();
      setResult(poemResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `"${result.title}" by ${result.author}\n\n${result.lines.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'Poem copied to clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Poetry Randomizer</CardTitle>
        <CardDescription>
          Discover a random poem from classic literature. Powered by PoetryDB.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
        {isLoading && (
          <div className="w-full space-y-4 p-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <Separator className="my-4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        )}
        {!isLoading && result && (
          <div className="relative w-full animate-fade-in space-y-4 p-4 rounded-lg bg-card/50 border">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-primary">{result.title}</h3>
              <p className="text-sm text-muted-foreground">by {result.author}</p>
            </div>
            <Separator />
            <div className="mt-4 space-y-2 text-center text-card-foreground/90">
              {result.lines.map((line, index) => (
                <p key={index} className="italic">{line || <br />}</p>
              ))}
            </div>
            <div className="absolute -top-2 right-0">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
          <div className="text-center text-muted-foreground p-4">
              <Feather className="h-16 w-16 mx-auto mb-4" />
              <p>Click the button to be inspired by a random poem.</p>
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
            ? 'Finding a poem...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Poem'}
        </Button>
      </CardFooter>
    </Card>
  );
}
