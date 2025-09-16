
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { COUNTRIES_DATA } from "@/lib/countries-data";
import { recommendCity } from "@/ai/flows/travel-recommender-flow";

interface Recommendation {
  country: string;
  city: string;
  description: string;
}

export default function TravelRandomizer() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRandomize = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      // 1. Randomly select a country
      const randomCountry = COUNTRIES_DATA[Math.floor(Math.random() * COUNTRIES_DATA.length)];
      
      // 2. Get city recommendation from AI
      const result = await recommendCity({
        country: randomCountry.country,
        cities: randomCountry.cities,
      });

      setRecommendation({
        country: randomCountry.country,
        city: result.city,
        description: result.description,
      });

    } catch (err) {
      console.error("Failed to get travel recommendation:", err);
      setError("Sorry, I couldn't get a recommendation right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Travel Destination Randomizer</CardTitle>
        <CardDescription>
          Let AI suggest the best city for you in a randomly selected country. <i>Powered by Gemini</i>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {!isLoading && recommendation && (
          <div className="animate-fade-in space-y-4">
             <h2 className="text-2xl font-bold text-primary">{recommendation.city}</h2>
             <p className="text-lg text-muted-foreground">{recommendation.country}</p>
             <p className="text-card-foreground/90 pt-2">
                {recommendation.description}
             </p>
          </div>
        )}
        {!isLoading && !recommendation && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[150px] p-8 bg-muted/30 rounded-lg">
                <BrainCircuit className="h-12 w-12 mb-4" />
                <p>Your next travel adventure awaits!</p>
                <p className="text-sm">Click the button below to get a random destination.</p>
            </div>
        )}
        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? "Finding your destination..." : "Suggest a Destination"}
        </Button>
      </CardFooter>
    </Card>
  );
}
