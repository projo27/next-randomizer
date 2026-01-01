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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, BrainCircuit, Image as ImageIcon, CookingPot, ChefHat, Sandwich, Utensils } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { threwConfetti } from '@/lib/confetti';
import { useSettings } from '@/context/SettingsContext';
import { generateTodaysCooking, generateRecipeImage, TodaysCookingOutput } from '@/ai/flows/today-cooking-flow';
import { COUNTRIES_DATA } from '@/lib/countries-data';
import { Separator } from './ui/separator';

const CUISINE_COUNTRIES = COUNTRIES_DATA.map(c => c.country).sort();

export default function TodayCookingRandomizer() {
  const [country, setCountry] = useState('all');
  const [result, setResult] = useState<TodaysCookingOutput | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { confettiConfig } = useSettings();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(10000); // 10s cooldown for AI calls

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_cooking_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setImageUrl(null);
    setIsGeneratingImage(false);

    try {
      const selectedCountry = country === 'all' ? CUISINE_COUNTRIES[Math.floor(Math.random() * CUISINE_COUNTRIES.length)] : country;
      
      const recipeResponse = await generateTodaysCooking({ country: selectedCountry });
      setResult(recipeResponse);
      setIsLoading(false); // Stop main loading to show text result

      // Start image generation in the background
      setIsGeneratingImage(true);
      generateRecipeImage({ 
        dishName: recipeResponse.dishName, 
        description: recipeResponse.description,
        country: selectedCountry 
      }).then(imageResponse => {
        setImageUrl(imageResponse.imageUrl);
      }).catch(err => {
        console.error("Image generation failed:", err);
      }).finally(() => {
        setIsGeneratingImage(false);
      });

      if (confettiConfig.enabled) {
        threwConfetti({
          particleCount: confettiConfig.particleCount,
          spread: confettiConfig.spread,
        });
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while generating the recipe.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Today's Cooking Randomizer</CardTitle>
        <CardDescription>
          Don't know what to cook? Get a random recipe recommendation from any cuisine! <i>Powered by Gemini</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="country-select">Cuisine</Label>
          <Select value={country} onValueChange={setCountry} disabled={isLoading || isRateLimited}>
            <SelectTrigger id="country-select">
              <SelectValue placeholder="Select a Cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Cuisine (Random)</SelectItem>
              {CUISINE_COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-[400px] flex flex-col items-center justify-center">
          {isLoading && (
            <div className="w-full space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          )}
          {!isLoading && result && (
            <div className="w-full animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold text-primary">{result.dishName}</h3>
                <p className="text-muted-foreground italic">"{result.description}"</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {isGeneratingImage && <ChefHat className="h-16 w-16 text-muted-foreground animate-pulse" />}
                    {imageUrl && <Image src={imageUrl} alt={result.dishName} fill className="object-cover" />}
                    {!isGeneratingImage && !imageUrl && <ImageIcon className="h-16 w-16 text-muted-foreground" />}
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg flex items-center gap-2 mb-2"><Sandwich className="h-5 w-5" /> Ingredients</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                      {result.ingredients.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg flex items-center gap-2 mb-2"><Utensils className="h-5 w-5" /> Instructions</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm pl-2">
                    {result.instructions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
          {!isLoading && !result && !error && (
            <div className="text-center text-muted-foreground p-4">
              <CookingPot className="h-16 w-16 mx-auto mb-4" />
              <p>Click the button to get a random recipe idea.</p>
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
          {isLoading ? 'Thinking of a recipe...' : isRateLimited ? 'Please wait...' : 'Get Recipe Idea'}
        </Button>
      </CardFooter>
    </Card>
  );
}
