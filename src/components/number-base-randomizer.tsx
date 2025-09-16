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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useRateLimiter } from "@/hooks/use-rate-limiter";

interface Result {
  decimal: number;
  binary: string;
  octal: string;
  hex: string;
}

export default function NumberBaseRandomizer() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("1000");
  const [result, setResult] = useState<Result | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handleRandomize = () => {
    triggerRateLimit();
    setError(null);
    setResult(null);
    setCopiedKey(null);

    const minNum = parseInt(min, 10);
    const maxNum = parseInt(max, 10);

    if (isNaN(minNum) || isNaN(maxNum)) {
      setError("Please enter valid minimum and maximum numbers.");
      return;
    }
    
    if (minNum >= maxNum) {
        setError("Minimum number must be less than the maximum number.");
        return;
    }
    
    if (maxNum > 1000000) {
        setError("Maximum number cannot be greater than 1,000,000 to ensure performance.");
        return;
    }

    setIsGenerating(true);

    const randomNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    setTimeout(() => {
        setResult({
            decimal: randomNumber,
            binary: randomNumber.toString(2),
            octal: randomNumber.toString(8),
            hex: randomNumber.toString(16).toUpperCase(),
        });
        setIsGenerating(false);
    }, 500);
  };

  const handleCopy = (key: keyof Result, value: string | number) => {
    navigator.clipboard.writeText(value.toString());
    setCopiedKey(key);
    toast({
      title: "Copied!",
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} value copied to clipboard.`,
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Number Base Randomizer</CardTitle>
        <CardDescription>Generate a random number and see it in different number systems.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="min-base">Minimum</Label>
            <Input
              id="min-base"
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              disabled={isGenerating || isRateLimited}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="max-base">Maximum</Label>
            <Input
              id="max-base"
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              disabled={isGenerating || isRateLimited}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          disabled={isGenerating || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : isRateLimited ? "Please wait..." : "Generate Number"}
        </Button>
        {isGenerating && (
            <div className="w-full space-y-2 mt-6">
                <div className="h-8 bg-muted rounded-md animate-pulse" />
                <div className="h-8 bg-muted rounded-md animate-pulse" />
                <div className="h-8 bg-muted rounded-md animate-pulse" />
                <div className="h-8 bg-muted rounded-md animate-pulse" />
            </div>
        )}
        {result && !isGenerating && (
            <div className="mt-6 w-full space-y-2">
                {Object.entries(result).map(([key, value]) => (
                    <div key={key} className="relative flex items-center">
                        <Label htmlFor={key} className="w-28 text-sm text-muted-foreground">{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                        <Input id={key} readOnly value={value} className="font-mono text-base pr-10" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 h-8 w-8"
                            onClick={() => handleCopy(key as keyof Result, value)}
                        >
                            {copiedKey === key ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <Copy className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
