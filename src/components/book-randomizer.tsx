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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, BookOpen, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomBook } from '@/app/actions/book-randomizer-action';
import type { BookResult } from '@/types/book-result';

const GENRES = [
  { value: 'science_fiction', label: 'Science Fiction' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'history', label: 'History' },
  { value: 'biography', label: 'Biography' },
  { value: 'science', label: 'Science' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'horror', label: 'Horror' },
];

export default function BookRandomizer() {
  const [genre, setGenre] = useState('science_fiction');
  const [result, setResult] = useState<BookResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5000); // Longer timeout for external API
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_book_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const bookResult = await getRandomBook(genre);
      if (bookResult) {
        setResult(bookResult);
      } else {
        setError('Could not find a book for this genre. Please try again or select another genre.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching a book.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Book Randomizer</CardTitle>
        <CardDescription>
          Discover a random book from a selected genre. Powered by Open Library.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5 mx-auto">
          <Label htmlFor="genre-select">Choose a Genre</Label>
          <Select
            value={genre}
            onValueChange={setGenre}
            disabled={isLoading || isRateLimited}
          >
            <SelectTrigger id="genre-select">
              <SelectValue placeholder="Select a Genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-[400px] flex items-center justify-center">
          {isLoading && (
            <div className="w-full grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-4">
              <Skeleton className="w-full aspect-[2/3] rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          )}
          {!isLoading && result && (
            <div className="w-full grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 animate-fade-in p-4 border rounded-lg bg-card/50">
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden border">
                    <Image
                        src={result.coverUrl}
                        alt={`Cover of ${result.title}`}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-primary">{result.title}</h3>
                    <p className="text-md text-muted-foreground">by {result.author}</p>
                    <p className="text-sm text-card-foreground/80 pt-2 line-clamp-6">
                        {result.description || 'No description available.'}
                    </p>
                    <div className="pt-4">
                        <Button asChild>
                            <Link href={result.openLibraryUrl} target="_blank" rel="noopener noreferrer">
                                View on Open Library <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
          )}
          {!isLoading && !result && !error && (
            <div className="text-center text-muted-foreground p-4">
              <BookOpen className="h-16 w-16 mx-auto mb-4" />
              <p>Find your next great read!</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Oops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading
            ? 'Finding a Book...'
            : isRateLimited
            ? 'Please wait...'
            : 'Randomize Book'}
        </Button>
      </CardFooter>
    </Card>
  );
}
