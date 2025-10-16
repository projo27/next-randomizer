"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wand2, Copy, Check } from "lucide-react";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Alert, AlertDescription } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";
import { randomizeNumber } from "@/app/actions/number-randomizer-action";
import { useSettings } from "@/context/SettingsContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";

function ResultDisplay({
  isRandomizing,
  results,
  onCopy,
  isCopied,
}: {
  isRandomizing: boolean;
  results: number[] | null;
  onCopy: () => void;
  isCopied: boolean;
}) {
  if (isRandomizing) {
    return (
      <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
        <CardHeader>
          <CardTitle>Generating Number(s)...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded-md animate-pulse" />
            <div className="h-6 bg-muted rounded-md animate-pulse w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  const isSingleResult = results.length === 1;

  return (
    <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {isSingleResult ? "Random Number" : "Random Numbers"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCopy}>
          {isCopied ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isSingleResult ? (
          <div className="text-center">
            <p className="text-5xl font-bold text-accent animate-fade-in">
              {results[0]}
            </p>
          </div>
        ) : (
          <ol className="list-decimal list-inside space-y-2 columns-2 md:columns-3 lg:columns-4">
            {results.map((item, index) => (
              <li key={index} className="text-xl font-bold font-mono">
                {item}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export default function NumberRandomizer() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [result, setResult] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { toast } = useToast();
  const { animationDuration } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();

  useEffect(() => {
    if (!isRandomizing) {
      stopAudio();
    }
  }, [isRandomizing, stopAudio]);

  const handleRandomize = async () => {
    if (isRandomizing || isRateLimited) return;
    triggerRateLimit();
    playAudio();
    setError(null);
    setResult(null);
    setIsCopied(false);

    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    const countNum = parseInt(count, 10);

    if (isNaN(minNum) || isNaN(maxNum) || isNaN(countNum)) {
      setError("Please enter valid numbers for all fields.");
      return;
    }

    if (countNum <= 0) {
      setError("Number of results must be at least 1.");
      return;
    }

    if (minNum >= maxNum) {
      setError("Minimum must be less than maximum.");
      return;
    }

    setIsRandomizing(true);

    try {
      const serverResult = await randomizeNumber(minNum, maxNum, countNum);
      setTimeout(() => {
        setResult(serverResult);
        setIsRandomizing(false);
      }, animationDuration * 1000);
    } catch (e: any) {
      setError(e.message);
      setIsRandomizing(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const resultString = result.join("\n");
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Number Randomizer</CardTitle>
        <CardDescription>
          Pick one or more random numbers from a given range.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="min">Minimum</Label>
            <Input
              id="min"
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              step="any"
              disabled={isRandomizing || isRateLimited}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="max">Maximum</Label>
            <Input
              id="max"
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              step="any"
              disabled={isRandomizing || isRateLimited}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="count">Number of Results</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              disabled={isRandomizing || isRateLimited}
            />
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ResultDisplay
          isRandomizing={isRandomizing}
          results={result}
          onCopy={handleCopyResult}
          isCopied={isCopied}
        />
      </CardContent>
      <CardFooter className="flex flex-col">
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
            : "Randomize!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
