
"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import {
  getRandomCountries,
  CountryResult,
} from "@/app/actions/country-randomizer-action";
import { useSettings } from "@/context/SettingsContext";
import { threwConfetti } from "@/lib/confetti";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";

export default function CountryRandomizer() {
  const [count, setCount] = useState("1");
  const [results, setResults] = useState<CountryResult[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration, confettiConfig } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();

  useEffect(() => {
    if (!isRandomizing) {
      stopAudio();
    }
  }, [isRandomizing, stopAudio]);

  const handleRandomize = async () => {
    sendGTMEvent({
      event: "action_country_randomizer",
      user_email: user ? user.email : "guest",
    });
    if (isRandomizing || isRateLimited) return;
    triggerRateLimit();
    playAudio();
    setError(null);
    setIsCopied(false);

    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount <= 0) {
      setError("Please enter a valid number of countries to generate.");
      return;
    }

    setIsRandomizing(true);
    setResults([]);

    try {
      const newResults = await getRandomCountries(numCount);
      setTimeout(() => {
        setResults(newResults);
        setIsRandomizing(false);
        if (confettiConfig.enabled) {
          threwConfetti({
            particleCount: confettiConfig.particleCount,
            spread: confettiConfig.spread,
          });
        }
      }, animationDuration * 1000);
    } catch (e: any) {
      setError(e.message);
      setIsRandomizing(false);
    }
  };

  const handleCopy = () => {
    if (results.length === 0) return;
    const textToCopy = results.map((r) => r.name).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "List of countries copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Country & Flag Randomizer</CardTitle>
        <CardDescription>
          Generate a random list of countries with their flags.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="country-count">Number of Countries</Label>
          <Input
            id="country-count"
            type="number"
            min="1"
            max="248"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            disabled={isRandomizing || isRateLimited}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative">
          {(isRandomizing || results.length > 0) && (
            <div className="absolute top-2 right-2">
              <Button variant="ghost" size="icon" onClick={handleCopy} disabled={isRandomizing}>
                {isCopied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4 min-h-[200px] p-4 bg-muted/50 rounded-lg">
            {isRandomizing &&
              [...Array(parseInt(count, 10) || 5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full">
                  <Skeleton className="min-h-[218px] h-auto w-1/2 xl:w-1/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 xl:w-1/4 rounded-md" />
                </div>
              ))}
            {!isRandomizing &&
              results.map((country, index) => (
                <div
                  key={country.code}
                  className="flex flex-col items-center text-center gap-2 animate-fade-in w-1/2 xl:w-1/4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Image
                    src={country.flagUrl}
                    alt={`${country.name} flag`}
                    width={256}
                    height={160}
                    className="h-auto w-full object-cover rounded-md border border-border"
                  />
                  <span className="text-sm font-medium">{country.name}</span>
                </div>
              ))}
            {!isRandomizing && results.length === 0 && (
              <div className="col-span-full flex items-center justify-center">
                <p className="text-muted-foreground">Countries will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isRandomizing || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing
            ? "Generating..."
            : isRateLimited
              ? "Please wait..."
              : "Randomize Countries"}
        </Button>
      </CardFooter>
    </Card>
  );
}
