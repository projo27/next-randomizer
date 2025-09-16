
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
import AnimatedResult from "./animated-result";
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Alert, AlertDescription } from "./ui/alert";
import AnimatedResultList from "./animated-result-list";
import { useToast } from "@/hooks/use-toast";

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

  const handleRandomize = () => {
    triggerRateLimit();
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
    
    const isIntegerRange = Number.isInteger(minNum) && Number.isInteger(maxNum) && getDecimalDigits(min) === 0 && getDecimalDigits(max) === 0;

    if (isIntegerRange && countNum > (maxNum - minNum + 1)) {
        setError(`Cannot generate ${countNum} unique integers from a range of only ${maxNum - minNum + 1} possibilities.`);
        return;
    }
    if (countNum > 1000) {
      setError("Cannot generate more than 1000 numbers at a time.");
      return;
    }

    setIsRandomizing(true);
    
    setTimeout(() => {
        const decimalDigits = Math.max(getDecimalDigits(min), getDecimalDigits(max));
        const resultsSet = new Set<number>();
        let attempts = 0;

        while(resultsSet.size < countNum && attempts < countNum * 10) {
            const randomNumber = Math.random() * (maxNum - minNum) + minNum;
            const roundedNumber = parseFloat(randomNumber.toFixed(decimalDigits));
            resultsSet.add(roundedNumber);
            attempts++;
        }
        
        const finalResults = Array.from(resultsSet);
        if(finalResults.length < countNum) {
            setError(`Could only generate ${finalResults.length} unique numbers. Try a larger range or fewer numbers.`);
        }
        setResult(finalResults.sort((a,b) => a - b));
        setIsRandomizing(false);

    }, 500); // Animation delay
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


  function getDecimalDigits(value: string): number {
    if (value.indexOf('.') > -1) {
      return value.split('.')[1].length;
    }
    return 0;
  }

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Number Randomizer</CardTitle>
        <CardDescription>Pick one or more random numbers from a given range.</CardDescription>
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
        
        {result && result.length === 1 && !isRandomizing && (
          <AnimatedResult result={result[0]} handleCopyResult={handleCopyResult} />
        )}
        {(isRandomizing || (result && result.length > 1)) && (
           <AnimatedResultList
            isShuffling={isRandomizing}
            shuffledItems={result ? result.map(r => r.toString()) : []}
            isResultCopied={isCopied}
            handleCopyResult={handleCopyResult}
            title="Random Numbers"
            itemClassName="text-xl font-bold font-mono"
           />
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          disabled={isRandomizing || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing ? "Generating..." : isRateLimited ? "Please wait..." : "Randomize!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
