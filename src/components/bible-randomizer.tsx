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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Wand2, BookOpen, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { useSettings } from '@/context/SettingsContext';
import { threwConfetti } from '@/lib/confetti';
import { useToast } from '@/hooks/use-toast';
import { getRandomBibleVerses, RandomVerseResult } from '@/app/actions/bible-randomizer-action';
import { BIBLE_BOOKS, BIBLE_TRANSLATIONS } from '@/lib/bible-data';
import { Separator } from './ui/separator';

export default function BibleRandomizer() {
  const [selectedBook, setSelectedBook] = useState('all');
  const [verseCount, setVerseCount] = useState('1');
  const [selectedTranslation, setSelectedTranslation] = useState('kjv');

  const [result, setResult] = useState<RandomVerseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(4000);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_bible_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    try {
      const count = parseInt(verseCount, 10);
      if (isNaN(count) || count < 1 || count > 20) {
        throw new Error('Please enter a valid number of verses (1-20).');
      }

      const verseResults = await getRandomBibleVerses(
        selectedBook,
        count,
        selectedTranslation
      );
      setResult(verseResults);

      if (verseResults && confettiConfig.enabled) {
        threwConfetti({
          particleCount: confettiConfig.particleCount,
          spread: confettiConfig.spread,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${result.reference}\n\n${result.text}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'The verses have been copied to your clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const oldTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'Old');
  const newTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'New');

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Bible Verse Randomizer</CardTitle>
        <CardDescription>
          Get random verses from the Holy Bible with different translations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="book-select">Book</Label>
            <Select value={selectedBook} onValueChange={setSelectedBook} disabled={isLoading || isRateLimited}>
              <SelectTrigger id="book-select">
                <SelectValue placeholder="Select a Book" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books (Random)</SelectItem>
                <SelectGroup>
                    <SelectLabel>Old Testament</SelectLabel>
                    {oldTestamentBooks.map(b => (
                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>New Testament</SelectLabel>
                    {newTestamentBooks.map(b => (
                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="verse-count">Number of Verses</Label>
            <Input
              id="verse-count"
              type="number"
              min="1"
              max="20"
              value={verseCount}
              onChange={(e) => setVerseCount(e.target.value)}
              disabled={isLoading || isRateLimited}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="translation-select">Translation</Label>
            <Select value={selectedTranslation} onValueChange={setSelectedTranslation} disabled={isLoading || isRateLimited}>
              <SelectTrigger id="translation-select">
                <SelectValue placeholder="Select a Translation" />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_TRANSLATIONS.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="min-h-[250px] flex items-center justify-center">
          {isLoading && (
            <div className="w-full space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {!isLoading && result && (
            <div className="w-full space-y-4 animate-fade-in relative">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-primary">{result.reference}</h3>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
              <div className="p-4 border rounded-lg bg-card/50 space-y-4">
                <p className="text-lg leading-relaxed">{result.text}</p>
                <Separator />
                <p className="text-xs text-muted-foreground">Translation: {result.translation_name}</p>
              </div>
            </div>
          )}
          {!isLoading && !result && !error && (
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>Your random verse(s) will appear here.</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Oops! An Error Occurred</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Finding Verse(s)...' : 'Randomize Bible Verse'}
        </Button>
      </CardFooter>
    </Card>
  );
}
