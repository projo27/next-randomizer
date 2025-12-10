'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Palette, User, Calendar, Type, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomArt, ArtworkResult } from '@/app/actions/art-randomizer-action';
import { Separator } from './ui/separator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { threwConfetti } from '@/lib/confetti';
import { useSettings } from '@/context/SettingsContext';

function ArtworkDetail({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="text-accent">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function ArtRandomizer() {
  const [result, setResult] = useState<ArtworkResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_art_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const artResult = await getRandomArt();
      setResult(artResult);
      if (confettiConfig.enabled) {
        threwConfetti({
          particleCount: confettiConfig.particleCount,
          spread: confettiConfig.spread,
        });
      }
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
        <CardTitle>Art Randomizer</CardTitle>
        <CardDescription>
          Discover random public domain artworks from the Art Institute of Chicago.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex flex-col items-center justify-center">
        {isLoading && (
          <div className="w-full space-y-4">
            <Skeleton className="h-80 w-full rounded-lg" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full mt-4" />
            </div>
          </div>
        )}
        {!isLoading && result && (
          <div className="w-full animate-fade-in space-y-4">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
              <Image
                src={`/api/image-proxy?url=${encodeURIComponent(`${result.image_config?.iiif_url}/${result.image_id}/full/843,/0/default.jpg`)}`}
                alt={`${result.title}`}
                fill
                className="object-contain"
                unoptimized={true}
              />
              {/* <img src={`${result.image_config?.iiif_url}/${result.image_id}/full/843,/0/default.jpg`} alt="" className="object-contain w-full h-full" /> */}
            </div>

            <div className="space-y-4 pt-4 text-center">
              <h3 className="text-2xl font-bold text-primary">{result.title}</h3>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left pt-2">
                <ArtworkDetail icon={<User />} label="Artist" value={result.artist_display} />
                <ArtworkDetail icon={<Calendar />} label="Date" value={result.date_display} />
                <ArtworkDetail icon={<Type />} label="Artwork Type" value={result.artwork_type_title} />
              </div>
              {result.description && (
                <div className="text-left pt-4">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Info className="h-5 w-5 text-accent" />
                    About this Artwork
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.description}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
          <div className="text-center text-muted-foreground p-4">
            <Palette className="h-16 w-16 mx-auto mb-4" />
            <p>Click the button to discover a random masterpiece.</p>
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
            ? 'Searching the museum...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Artwork'}
        </Button>
      </CardFooter>
    </Card>
  );
}
