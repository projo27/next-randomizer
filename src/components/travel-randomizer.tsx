
"use client";

import { useState } from "react";
import Image from "next/image";
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
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Recommendation {
  country: string;
  city: string;
  description: string;
  imageUrl: string;
}

export default function TravelRandomizer() {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRandomize = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      let countryToProcess;

      if (selectedCountry === "all") {
        // 1. Randomly select a country if "All Countries" is chosen
        countryToProcess = COUNTRIES_DATA[Math.floor(Math.random() * COUNTRIES_DATA.length)];
      } else {
        // 2. Find the selected country from the data
        countryToProcess = COUNTRIES_DATA.find(c => c.country === selectedCountry);
        if (!countryToProcess) {
          throw new Error("Selected country not found.");
        }
      }
      
      // 3. Get city recommendation from AI for the chosen country
      const result = await recommendCity({
        country: countryToProcess.country,
        cities: countryToProcess.cities,
      });

      setRecommendation({
        country: countryToProcess.country,
        city: result.city,
        description: result.description,
        imageUrl: result.imageUrl,
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
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="country-select">Choose a Country</Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={isLoading}>
            <SelectTrigger id="country-select">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries (Random)</SelectItem>
              {COUNTRIES_DATA.map((country) => (
                <SelectItem key={country.country} value={country.country}>
                  {country.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-h-[250px] md:min-h-[200px]">
          {isLoading && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          )}
          {!isLoading && recommendation && (
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
              <div className="space-y-4">
                 <h2 className="text-2xl font-bold text-primary">{recommendation.city}</h2>
                 <p className="text-lg text-muted-foreground">{recommendation.country}</p>
                 <p className="text-card-foreground/90 pt-2">
                    {recommendation.description}
                 </p>
              </div>
              <div className="relative aspect-video md:aspect-auto h-48 w-full overflow-hidden rounded-lg">
                <Image 
                  src={recommendation.imageUrl}
                  alt={`Photo of ${recommendation.city}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          )}
          {!isLoading && !recommendation && !error && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full p-8 bg-muted/30 rounded-lg">
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
        </div>
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
