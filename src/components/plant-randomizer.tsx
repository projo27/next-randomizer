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
import { Label } from '@/components/ui/label';
import { Wand2, Sprout, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomPlant, PlantResult } from '@/app/actions/plant-randomizer-action';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

function PlantDetails({ label, value, tooltip }: { label: string, value: string | number | undefined | null, tooltip?: string }) {
    if (!value) return null;
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-1">
                <Label className="text-sm text-muted-foreground">{label}</Label>
                {tooltip && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            <p className="text-md font-semibold capitalize">{value.toString()}</p>
        </div>
    );
}

export default function PlantRandomizer() {
  const [result, setResult] = useState<PlantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5000); // Longer timeout for external API
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({
      event: 'action_plant_randomizer',
      user_email: user?.email ?? 'guest',
    });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);

    try {
      const plantResult = await getRandomPlant();
      setResult(plantResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Plant Randomizer</CardTitle>
        <CardDescription>
          Discover a random plant from a vast botanical database. Powered by Trefle.io.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex flex-col items-center justify-center">
        {isLoading && (
          <div className="w-full space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-2 pt-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-12 w-full mt-4" />
            </div>
          </div>
        )}
        {!isLoading && result && (
          <div className="w-full animate-fade-in space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
               <Image
                    src={result.image_url || `https://picsum.photos/seed/${result.id}/800/600`}
                    alt={result.common_name || result.scientific_name}
                    fill
                    className="object-cover"
                    data-ai-hint={`${result.genus} ${result.family}`}
                />
            </div>
            <div className="space-y-4">
                <h3 className="text-3xl font-bold text-primary capitalize">{result.common_name || result.scientific_name}</h3>
                <p className="text-sm text-muted-foreground italic">{result.scientific_name}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4">
                    <PlantDetails label="Family" value={result.family_common_name || result.family} />
                    <PlantDetails label="Genus" value={result.genus} />
                    <PlantDetails label="Year Discovered" value={result.year} />
                </div>

            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
          <div className="text-center text-muted-foreground p-4">
              <Sprout className="h-16 w-16 mx-auto mb-4" />
              <p>Click the button to discover a random plant.</p>
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
            ? 'Searching the wild...'
            : isRateLimited
              ? 'Please wait...'
              : 'Randomize Plant'}
        </Button>
      </CardFooter>
    </Card>
  );
}
