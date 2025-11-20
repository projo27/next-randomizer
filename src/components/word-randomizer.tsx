// src/components/word-randomizer.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Wand2, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomWord, PartOfSpeech } from '@/app/actions/word-randomizer-action';
import { PARTS_OF_SPEECH } from '@/lib/word-data';

export default function WordRandomizer() {
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('all');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(1000);
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_word_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);

    try {
      const word = await getRandomWord(partOfSpeech);
      setResult(word);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'Random word copied to clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Random Word Generator</CardTitle>
        <CardDescription>
          Generate a random English word, with an option to filter by its part of speech.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="part-of-speech">Part of Speech</Label>
          <Select
            value={partOfSpeech}
            onValueChange={(value) => setPartOfSpeech(value as PartOfSpeech)}
            disabled={isLoading || isRateLimited}
          >
            <SelectTrigger id="part-of-speech">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types (Random)</SelectItem>
              {PARTS_OF_SPEECH.map((pos) => (
                <SelectItem key={pos} value={pos} className="capitalize">
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-[150px] flex items-center justify-center bg-muted/50 rounded-lg p-4 relative">
          {isLoading ? (
            <p className="text-3xl font-bold animate-pulse text-muted-foreground">Generating...</p>
          ) : result ? (
            <>
              <p className="text-5xl font-bold text-accent animate-fade-in">{result}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="absolute top-2 right-2"
              >
                {isCopied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">Your random word will appear here.</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
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
          {isLoading ? 'Generating...' : isRateLimited ? 'Please wait...' : 'Randomize Word'}
        </Button>
      </CardFooter>
    </Card>
  );
}
