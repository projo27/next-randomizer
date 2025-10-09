
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { generateLottery } from "@/app/actions/lottery-generator-action";

export default function LotteryGenerator() {
  const [includeLetters, setIncludeLetters] = useState(false);
  const [length, setLength] = useState("6");
  const [duration, setDuration] = useState("5");
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, dismiss } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);


  const handleGenerate = async () => {
    if (isGenerating) return;
    triggerRateLimit();
    setIsGenerating(true);
    setIsCopied(false);
    setResult(null);
    setError(null);

    const len = parseInt(length, 10);
    const dur = parseInt(duration, 10);

    if (isNaN(len) || len <= 0 || len > 100) {
      setError("Please enter a length between 1 and 100.");
      setIsGenerating(false);
      return;
    }
    if (isNaN(dur) || dur < 1 || dur > 30) {
      setError("Please enter a duration between 1 and 30 seconds.");
      setIsGenerating(false);
      return;
    }

    const characterSet = includeLetters ? "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "0123456789";

    animationIntervalRef.current = setInterval(() => {
      let tempResult = "";
      for (let i = 0; i < len; i++) {
        tempResult += characterSet.charAt(
          Math.floor(Math.random() * characterSet.length)
        );
      }
      setResult(tempResult);
    }, 50);

    let countdown = dur;
    const { id: toastId, update } = toast({
      title: "Counting Down in...",
      description: <span className="text-3xl">{countdown}s</span>,
      duration: (dur + 2) * 1000,
    });

    countdownIntervalRef.current = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        update({ id: toastId, description: <span className="text-3xl">{countdown}s</span>});
      }
    }, 1000);

    try {
        const finalResult = await generateLottery(len, includeLetters);
        setTimeout(() => {
          if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          
          setResult(finalResult);
          setIsGenerating(false);

          update({ id: toastId, title: 'Lottery Number WIN!', description: finalResult, hidden: true });
        }, dur * 1000);
    } catch(e: any) {
        setError(e.message);
        setIsGenerating(false);
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        dismiss(toastId);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Combination copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Lottery Generator</CardTitle>
        <CardDescription>
          Generate a random combination of numbers and/or letters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="combination-length">Length</Label>
            <Input
              id="combination-length"
              type="number"
              min="1"
              max="100"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              disabled={isGenerating || isRateLimited}
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="duration">Duration (s)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isGenerating || isRateLimited}
            />
          </div>
          <div className="flex w-full items-center gap-2 space-x-2">
            <Switch
              id="include-letters"
              checked={includeLetters}
              onCheckedChange={setIncludeLetters}
              disabled={isGenerating || isRateLimited}
            />
            <Label htmlFor="include-letters">Include Letters</Label>
          </div>
        </div>

        {(result || isGenerating) && (
          <div className="relative min-h-[60px] flex items-center justify-center bg-muted/50 rounded-lg p-8">
            <p className="text-4xl tracking-widest text-accent font-mono select-all">
              {result}
            </p>
            {result && !isGenerating && (
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
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
          onClick={handleGenerate}
          disabled={isGenerating || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : isRateLimited ? "Please wait..." : "Generate Combination"}
        </Button>
      </CardFooter>
    </Card>
  );
}
