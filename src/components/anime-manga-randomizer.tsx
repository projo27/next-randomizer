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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wand2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomJikanEntry, JikanResult, JikanRequestType } from '@/app/actions/jikan-api-action';
import { ScrollArea } from './ui/scroll-area';

function ResultCard({ result, type }: { result: JikanResult; type: JikanRequestType }) {
  const imageUrl = result.images?.jpg?.image_url;
  const isCharacter = type === 'characters';

  return (
    <div className="w-full animate-fade-in space-y-4">
      <Card className="bg-card/50">
        <div className="grid grid-cols-1 md:grid-cols-[225px_1fr] gap-6 p-6">
          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border bg-muted">
            {imageUrl ? (
              <Image src={imageUrl} alt={result.title || (result as any).name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-primary">{result.title || (result as any).name}</h3>

            {!isCharacter && 'score' in result && result.score && (
              <Badge variant="secondary">Score: {result.score.toFixed(2)}</Badge>
            )}

            {isCharacter && 'seriesTitle' in result && (
              <p className="text-sm text-muted-foreground">From: {(result as any).seriesTitle}</p>
            )}
            
            <ScrollArea className="h-48 pr-4">
                <p className="text-sm text-card-foreground/90">
                    {(isCharacter ? (result as any).about : (result as any).synopsis) || 'No description available.'}
                </p>
            </ScrollArea>
            
            {'genres' in result && result.genres && (
              <div className="flex flex-wrap gap-2">
                {result.genres.map(genre => <Badge key={genre.name}>{genre.name}</Badge>)}
              </div>
            )}

            <div className="pt-4">
              <Button asChild>
                <Link href={result.url} target="_blank" rel="noopener noreferrer">
                  View on MyAnimeList <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


export default function AnimeMangaRandomizer() {
  const [type, setType] = useState<JikanRequestType>('anime');
  const [result, setResult] = useState<JikanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000); // Jikan API has rate limits
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_jikan_randomizer', user_email: user?.email ?? 'guest', type });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiResult = await getRandomJikanEntry(type);
      setResult(apiResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Anime & Manga Randomizer</CardTitle>
        <CardDescription>
          Discover a random anime, manga, or character from MyAnimeList.net. <i>Powered by the Jikan API</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={type} onValueChange={(v) => setType(v as JikanRequestType)} className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="anime" id="anime" />
            <Label htmlFor="anime">Anime</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manga" id="manga" />
            <Label htmlFor="manga">Manga</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="characters" id="character" />
            <Label htmlFor="character">Character</Label>
          </div>
        </RadioGroup>

        <div className="min-h-[400px] flex flex-col items-center justify-center">
          {isLoading && (
            <div className="w-full grid grid-cols-1 md:grid-cols-[225px_1fr] gap-6 p-6">
               <Skeleton className="w-full aspect-[2/3] rounded-lg" />
               <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-20 w-full mt-4" />
                    <Skeleton className="h-10 w-32 mt-4" />
               </div>
            </div>
          )}
          {!isLoading && result && <ResultCard result={result} type={type} />}
          {!isLoading && !result && !error && (
            <div className="text-center text-muted-foreground p-4">
              <p>Select a type and click the button to get a random entry.</p>
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
          {isLoading
            ? 'Searching the database...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize!'}
        </Button>
      </CardFooter>
    </Card>
  );
}