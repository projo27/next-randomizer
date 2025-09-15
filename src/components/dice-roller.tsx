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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dices, Wand2 } from "lucide-react";
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
} from "lucide-react";

const diceIcons = [
  <Dice1 key={1} className="h-16 w-16" />,
  <Dice2 key={2} className="h-16 w-16" />,
  <Dice3 key={3} className="h-16 w-16" />,
  <Dice4 key={4} className="h-16 w-16" />,
  <Dice5 key={5} className="h-16 w-16" />,
  <Dice6 key={6} className="h-16 w-16" />,
];

export default function DiceRoller() {
  const [numberOfDice, setNumberOfDice] = useState("1");
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);
    const numDice = parseInt(numberOfDice, 10);
    const newResults: number[] = [];
    for (let i = 0; i < numDice; i++) {
      newResults.push(Math.floor(Math.random() * 6) + 1);
    }

    setTimeout(() => {
      setResults(newResults);
      setIsRolling(false);
    }, 1000); // Duration of the animation
  };

  const total = results.reduce((sum, val) => sum + val, 0);

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Dice Roller</CardTitle>
        <CardDescription>
          Roll one or more dice and see the result.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="num-dice">Number of Dice</Label>
          <Select
            value={numberOfDice}
            onValueChange={setNumberOfDice}
            disabled={isRolling}
          >
            <SelectTrigger id="num-dice" className="w-24">
              <SelectValue placeholder="1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center items-center min-h-[120px] gap-4 flex-wrap">
          {isRolling &&
            Array.from({ length: parseInt(numberOfDice, 10) }).map((_, i) => (
              <Dices key={i} className="h-16 w-16 animate-spin-dice" />
            ))}
          {!isRolling &&
            results.length > 0 &&
            results.map((result, i) => (
              <div key={i} className="text-primary">
                {diceIcons[result - 1]}
              </div>
            ))}
        </div>
        {!isRolling && results.length > 0 && (
          <div className="text-center">
            <p className="text-lg font-bold">Total: {total}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRolling ? "Rolling..." : "Roll Dice!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
