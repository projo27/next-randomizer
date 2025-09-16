
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
import { Switch } from "@/components/ui/switch";
import { Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import AnimatedResult from "./animated-result";
import AnimatedResultList from "./animated-result-list";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";

function getDecimalDigits(value: string): number {
  if (value.indexOf('.') >= 0) {
    return value.length - value.indexOf('.') - 1;
  }
  return 0;
}

export default function NumberRandomizer() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [allowDecimals, setAllowDecimals] = useState(false);
  const [count, setCount] = useState("1");
  const [result, setResult] = useState<string | string[] | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handleRandomize = () => {
    triggerRateLimit();
    setError(null);
    setResult(null);
    setIsResultCopied(false);

    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);
    const numToGenerate = parseInt(count, 10);

    if (isNaN(minNum) || isNaN(maxNum)) {
      setError("Please enter valid minimum and maximum numbers.");
      return;
    }

    if (minNum >= maxNum) {
      setError("Minimum number must be less than the maximum number.");
      return;
    }
    
    if (isNaN(numToGenerate) || numToGenerate <= 0) {
      setError("Number of items to generate must be greater than 0.");
      return;
    }
    
    if (!allowDecimals) {
      const range = Math.floor(maxNum) - Math.ceil(minNum) + 1;
      if (numToGenerate > range) {
        setError(`Cannot generate ${numToGenerate} unique integers in a range of ${range} numbers.`);
        return;
      }
    }
     if (numToGenerate > 1000) {
      setError("Cannot generate more than 1000 numbers at a time.");
      return;
    }


    setIsRandomizing(true);
    
    setTimeout(() => {
        const results: (number | string)[] = [];
        const resultSet = new Set<number | string>();

        const minDigits = getDecimalDigits(min);
        const maxDigits = getDecimalDigits(max);
        const decimalPlaces = allowDecimals ? Math.max(minDigits, maxDigits, 2) : 0;
        
        let maxTries = numToGenerate * 100; // Safety break

        while(resultSet.size < numToGenerate && maxTries > 0) {
            const randomNum = minNum + Math.random() * (maxNum - minNum);
            const roundedNum = parseFloat(randomNum.toFixed(decimalPlaces));
            
            if (roundedNum >= minNum && roundedNum <= maxNum) {
                 resultSet.add(allowDecimals ? roundedNum : Math.floor(roundedNum));
            }
            maxTries--;
        }

        const finalResults = Array.from(resultSet).map(r => r.toString());

        if (numToGenerate === 1) {
            setResult(finalResults[0] ?? "N/A");
        } else {
            setResult(finalResults.sort((a,b) => parseFloat(a) - parseFloat(b)));
        }

        setIsRandomizing(false);
    }, 500);

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


  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Number Randomizer</CardTitle>
        <CardDescription>Get a random number within a specified range.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="min">Minimum</Label>
            <Input id="min" type="number" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="max">Maximum</Label>
            <Input id="max" type="number" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
        </div>
         <div className="grid w-full max-w-xs items-center gap-1.5">
            <Label htmlFor="num-to-generate">Number to Generate</Label>
            <Input
            id="num-to-generate"
            type="number"
            min="1"
            max="1000"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            />
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="allow-decimals" checked={allowDecimals} onCheckedChange={setAllowDecimals} />
          <Label htmlFor="allow-decimals">Allow Decimals</Label>
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
            disabled={isRandomizing || isRateLimited} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing ? "Randomizing..." : isRateLimited ? "Please wait..." : "Randomize!"}
        </Button>
         {result && !Array.isArray(result) && (
            <AnimatedResult result={result} handleCopyResult={handleCopyResult}/>
        )}
        {(isRandomizing || (result && Array.isArray(result))) && (
            <AnimatedResultList
                isShuffling={isRandomizing}
                shuffledItems={Array.isArray(result) ? result : []}
                isResultCopied={isResultCopied}
                handleCopyResult={handleCopyResult}
                title="Randomly Generated Numbers"
                itemClassName="font-mono text-lg"
            />
        )}
      </CardFooter>
    </Card>
  );
}
