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

export default function NumberRandomizer() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState<number | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handleRandomize = () => {
    triggerRateLimit();
    const minNum = parseFloat(min);
    const maxNum = parseFloat(max);

    const decimalDigit = Math.max(getDecimalDigits(minNum), getDecimalDigits(maxNum));

    if (isNaN(minNum) || isNaN(maxNum)) {
      setResult(null);
      return;
    }

    if(minNum > maxNum) {
      setMin(maxNum.toString());
      setMax(minNum.toString())
    }

    const randomNumber = Math.random() * (maxNum - minNum) + minNum;

    console.log(randomNumber.toFixed(decimalDigit), "digit ", decimalDigit);

    setResult(Number(randomNumber.toFixed(decimalDigit)));
  };

  function getDecimalDigits(number: number) : number {
    // Convert the number to a string
    const numberString = number.toString();
  
    // Find the index of the decimal point
    const decimalIndex = numberString.indexOf('.');
  
    // If there's no decimal point, return an empty string or handle as needed
    if (decimalIndex === -1) {
      return 0; // Or return null, 0, etc., depending on desired behavior
    }
  
    // Extract the substring after the decimal point
    const decimalDigits = numberString.substring(decimalIndex + 1).length;
  
    return Number(decimalDigits);
  }

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Number Randomizer</CardTitle>
        <CardDescription>Pick a random number from a given range.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="min">Minimum</Label>
            <Input
              id="min"
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              step="any"
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
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          disabled={isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRateLimited ? "Please wait..." : "Randomize!"}
        </Button>
        {result !== null && <AnimatedResult result={result} />}
      </CardFooter>
    </Card>
  );
}
