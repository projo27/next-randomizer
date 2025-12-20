'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Wand2, BookOpen, Copy, Check, Languages } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { useSettings } from '@/context/SettingsContext';
import { threwConfetti } from '@/lib/confetti';
import { useToast } from '@/hooks/use-toast';
import {
  getSurahList,
  getRandomVerses,
  getTranslationLanguages,
  Surah,
  Language,
  RandomVerseResult,
} from '@/app/actions/quran-randomizer-action';
import { Separator } from './ui/separator';

export default function QuranRandomizer() {
  // Option States
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [languageList, setLanguageList] = useState<Language[]>([]);
  const [selectedSurah, setSelectedSurah] = useState('all'); // 'all' or surah ID
  const [verseCount, setVerseCount] = useState('3');
  const [selectedTranslation, setSelectedTranslation] = useState('131'); // Default to English - Sahih International
  
  // Result States
  const [results, setResults] = useState<RandomVerseResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // Hooks
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(4000);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  // Fetch initial data for dropdowns
  const fetchOptions = useCallback(async () => {
    try {
      const [surahs, languages] = await Promise.all([
        getSurahList(),
        getTranslationLanguages(),
      ]);
      setSurahList(surahs);
      setLanguageList(languages);
    } catch (err: any) {
      setError('Could not load Surah and language options. Please refresh the page.');
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_quran_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setIsCopied(false);
    
    try {
      const surahId = selectedSurah === 'all'
        ? Math.floor(Math.random() * 114) + 1
        : parseInt(selectedSurah, 10);
        
      const count = parseInt(verseCount, 10);
      const translationId = parseInt(selectedTranslation, 10);

      if (isNaN(count) || count < 1 || count > 20) {
        throw new Error("Please enter a valid number of verses (1-20).");
      }
      
      const verseResults = await getRandomVerses(surahId, count, translationId);
      setResults(verseResults);

      if (confettiConfig.enabled) {
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
    if (results.length === 0) return;
    const textToCopy = results.map(v => `${v.verse_key}\n${v.text_uthmani}\n${v.translations[0].text}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'The verses have been copied to your clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const selectedSurahInfo = surahList.find(s => s.id.toString() === selectedSurah);

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Quran Randomizer</CardTitle>
        <CardDescription>
          Get random verses from the Holy Quran with translations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingOptions ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="surah-select">Surah (Chapter)</Label>
              <Select value={selectedSurah} onValueChange={setSelectedSurah} disabled={isLoading || isRateLimited}>
                <SelectTrigger id="surah-select">
                  <SelectValue placeholder="Select a Surah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Surahs (Random)</SelectItem>
                  {surahList.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.id}. {s.name_simple}
                    </SelectItem>
                  ))}
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
                  {languageList.map(lang => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="min-h-[250px] flex items-center justify-center">
          {isLoading && (
            <div className="w-full space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {!isLoading && results.length > 0 && (
            <div className="w-full space-y-4 animate-fade-in relative">
                <Button variant="ghost" size="icon" className="absolute top-0 right-0" onClick={handleCopy}>
                    {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
                {results.map((verse, index) => (
                    <div key={verse.id}>
                        <div className="p-4 border rounded-lg bg-card/50 space-y-4">
                            <p className="text-right text-3xl font-mono leading-relaxed" dir="rtl">
                                {verse.text_uthmani} <span className='text-xl text-primary font-sans'>({verse.verse_key.split(':')[1]})</span>
                            </p>
                            <Separator />
                            <p className="text-muted-foreground">{verse.translations[0].text}</p>
                        </div>
                    </div>
                ))}
            </div>
          )}
          {!isLoading && results.length === 0 && !error && (
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>Your random verses will appear here.</p>
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
          disabled={isLoading || isRateLimited || isLoadingOptions}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Finding Verses...' : 'Randomize Quran Verse'}
        </Button>
      </CardFooter>
    </Card>
  );
}
