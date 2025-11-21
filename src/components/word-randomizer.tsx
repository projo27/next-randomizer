
'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Wand2, Copy, Check, Volume2, Link as LinkIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomDictionaryWord, DictionaryEntry } from '@/app/actions/word-randomizer-action';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

function WordDisplay({ entry, onCopy, isCopied, onPlayAudio }: { 
    entry: DictionaryEntry;
    onCopy: () => void;
    isCopied: boolean;
    onPlayAudio: (audioUrl: string) => void;
}) {
    const mainPhonetic = entry.phonetics.find(p => p.text && p.audio);
    const audioUrl = mainPhonetic?.audio;

    return (
        <div className="w-full animate-fade-in space-y-6 p-4 rounded-lg bg-card/50 border">
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h3 className="text-4xl font-bold capitalize text-primary">{entry.word}</h3>
                    {mainPhonetic?.text && (
                        <p className="text-muted-foreground">{mainPhonetic.text}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {audioUrl && (
                        <Button variant="outline" size="icon" onClick={() => onPlayAudio(audioUrl)}>
                            <Volume2 className="h-5 w-5" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={onCopy}>
                        {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                {entry.meanings.map((meaning, index) => (
                    <div key={index} className="space-y-3">
                        <Badge variant="secondary" className="capitalize">{meaning.partOfSpeech}</Badge>
                        <ul className="list-decimal list-inside space-y-3 pl-2">
                            {meaning.definitions.slice(0, 3).map((def, defIndex) => (
                                <li key={defIndex}>
                                    <p>{def.definition}</p>
                                    {def.example && (
                                        <p className="text-sm text-muted-foreground italic pl-4 mt-1">
                                            "{def.example}"
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                         {(meaning.synonyms && meaning.synonyms.length > 0) && (
                            <div className="pl-6">
                                <h4 className="text-sm font-semibold text-muted-foreground">Synonyms</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {meaning.synonyms.map(syn => <Badge key={syn} variant="outline">{syn}</Badge>)}
                                </div>
                            </div>
                        )}
                        {(meaning.antonyms && meaning.antonyms.length > 0) && (
                            <div className="pl-6">
                                <h4 className="text-sm font-semibold text-muted-foreground">Antonyms</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {meaning.antonyms.map(ant => <Badge key={ant} variant="outline">{ant}</Badge>)}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {entry.sourceUrls && entry.sourceUrls.length > 0 && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">Sources</h4>
                        {entry.sourceUrls.map((url, i) => (
                             <Button key={i} asChild variant="link" size="sm" className="p-0 h-auto block">
                                <Link href={url} target="_blank" rel="noopener noreferrer" className="text-xs truncate">
                                    <LinkIcon className="mr-2 h-3 w-3 inline-block" />{url}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}


export default function WordRandomizer() {
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(2000);
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
        audioRef.current?.pause();
        audioRef.current = null;
    }
  }, []);

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_word_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const wordData = await getRandomDictionaryWord();
      setResult(wordData);
    } catch (err: any) {
      setError(err.message || 'Could not fetch a word. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.word);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: `The word "${result.word}" has been copied to your clipboard.`,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handlePlayAudio = (audioUrl: string) => {
      if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
  }

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Random Dictionary Word</CardTitle>
        <CardDescription>
          Generate a random English word and discover its definition, pronunciation, and usage.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] flex items-center justify-center">
        {isLoading && (
            <div className="w-full space-y-4 p-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Separator className="my-4" />
                <Skeleton className="h-6 w-1/5 mb-2" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
            </div>
        )}
        {!isLoading && result && (
            <WordDisplay entry={result} onCopy={handleCopy} isCopied={isCopied} onPlayAudio={handlePlayAudio} />
        )}
        {!isLoading && !result && !error && (
            <p className="text-muted-foreground text-center">Click the button to generate a random word from the dictionary.</p>
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
          {isLoading ? 'Generating...' : isRateLimited ? 'Please wait...' : 'Get Random Word'}
        </Button>
      </CardFooter>
    </Card>
  );
}
