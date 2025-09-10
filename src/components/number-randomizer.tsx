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

export default function NumberRandomizer() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState<number | null>(null);

  const handleRandomize = () => {
    const minNum = parseInt(min, 10);
    const maxNum = parseInt(max, 10);

    if (isNaN(minNum) || isNaN(maxNum) || minNum > maxNum) {
      setResult(null);
      return;
    }

    const randomNumber =
      Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    setResult(randomNumber);
  };

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
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="max">Maximum</Label>
            <Input
              id="max"
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Randomize!
        </Button>
        {result !== null && <AnimatedResult result={result} />}
      </CardFooter>
    </Card>
  );
}
