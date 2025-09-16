
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AnimatedResult from "./animated-result";
import { Wand2, Copy, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import AnimatedResultList from "./animated-result-list";

// Fisher-Yates (aka Knuth) Shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ListRandomizer() {
  const [choicesText, setChoicesText] = useState(`Apples
Bananas
Oranges`);
  const [count, setCount] = useState("1");
  const [result, setResult] = useState<string | string[] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handleRandomize = () => {
    triggerRateLimit();
    setError(null);
    setResult(null);
    setIsResultCopied(false);

    const numToPick = parseInt(count, 10);
    const uniqueOptions = Array.from(
      new Set(
        choicesText
          .split("\n")
          .map((c) => c.trim())
          .filter((c) => c.length > 0)
      )
    );

    if (uniqueOptions.length === 0) {
      setError("Please enter at least one item in the list.");
      return;
    }
    
    if (isNaN(numToPick) || numToPick <= 0) {
      setError("Please enter a valid number of items to pick (must be > 0).");
      return;
    }

    if (numToPick > uniqueOptions.length) {
      setError(`Cannot pick ${numToPick} items. There are only ${uniqueOptions.length} unique items in the list.`);
      return;
    }

    setOptions(uniqueOptions);

    if (numToPick === 1) {
      setIsShuffling(false);
      const randomIndex = Math.floor(Math.random() * uniqueOptions.length);
      setResult(uniqueOptions[randomIndex]);
    } else {
      setIsShuffling(true);
      setTimeout(() => {
        const shuffled = shuffleArray(uniqueOptions);
        setResult(shuffled.slice(0, numToPick));
        setIsShuffling(false);
      }, 500);
    }
  };
  
  const handleCopyResult = () => {
    if (!result) return;
    const resultString = Array.isArray(result) ? result.join("\n") : result;
    navigator.clipboard.writeText(resultString);
    setIsResultCopied(true);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    });
    setTimeout(() => setIsResultCopied(false), 2000);
  };

  const handleCopyInput = () => {
    navigator.clipboard.writeText(choicesText);
    setIsInputCopied(true);
    toast({
      title: "Copied!",
      description: "Input list copied to clipboard.",
    });
    setTimeout(() => setIsInputCopied(false), 2000);
  };

  const handleClearInput = () => {
    setChoicesText("");
    setResult(null);
    setError(null);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>List Randomizer</CardTitle>
        <CardDescription>
          Enter your choices below, one per line. We'll pick one or more for you!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder={`Apples
Bananas
Oranges`}
            rows={8}
            value={choicesText}
            onChange={(e) => setChoicesText(e.target.value)}
            className="resize-none pr-20"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopyInput}>
              {isInputCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClearInput}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
         <div className="grid w-full max-w-xs items-center gap-1.5">
            <Label htmlFor="num-items">Number of Items to Pick</Label>
            <Input
            id="num-items"
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            />
        </div>
         {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          disabled={isRateLimited || isShuffling}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isShuffling ? "Picking..." : isRateLimited ? "Please wait..." : "Randomize!"}
        </Button>
        {result && !Array.isArray(result) && (
            <AnimatedResult result={result} options={options} handleCopyResult={handleCopyResult}/>
        )}
        {(isShuffling || (result && Array.isArray(result))) && (
            <AnimatedResultList
                isShuffling={isShuffling}
                shuffledItems={Array.isArray(result) ? result : []}
                isResultCopied={isResultCopied}
                handleCopyResult={handleCopyResult}
                title="Randomly Picked Items"
                itemClassName="text-lg"
            />
        )}
      </CardFooter>
    </Card>
  );
}

