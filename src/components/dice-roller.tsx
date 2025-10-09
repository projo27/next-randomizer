
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
import { Wand2, Copy, Check } from "lucide-react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { cn } from "@/lib/utils";

const diceIcons = [
  <Dice1 key={1} className="h-32 w-32" />,
  <Dice2 key={2} className="h-32 w-32" />,
  <Dice3 key={3} className="h-32 w-32" />,
  <Dice4 key={4} className="h-32 w-32" />,
  <Dice5 key={5} className="h-32 w-32" />,
  <Dice6 key={6} className="h-32 w-32" />,
];

const animations = ["animate-spin-dice"];

const Polyhedron = ({ sides, result, isRolling }: { sides: number, result: number, isRolling: boolean }) => {
    let shapeClass, textClass;

    switch (sides) {
        case 4: shapeClass = "w-28 h-28 clip-triangle"; break;
        case 8: shapeClass = "w-28 h-28 clip-diamond"; break;
        case 10: shapeClass = "w-28 h-28 clip-pentagon"; break;
        case 12: shapeClass = "w-28 h-28 clip-dodecagon"; break;
        case 20: shapeClass = "w-28 h-28 clip-icosagon"; break;
        default: shapeClass = "w-28 h-28 rounded-lg"; break;
    }
    
    return (
        <div className={cn("relative flex items-center justify-center bg-muted dark:bg-muted/50 border-2 border-accent text-accent", shapeClass, isRolling && "animate-spin-dice")}>
             <span className="text-4xl font-bold">{result}</span>
        </div>
    )
}

// Add CSS for custom shapes in globals.css if needed, or use inline styles/tailwind plugins
// For simplicity, we'll approximate with basic shapes and text.
const DiceDisplay = ({ type, result, isRolling, animationClass }: { type: number, result: number, isRolling: boolean, animationClass: string }) => {
    if (type === 6) {
        return (
            <div className={cn("dark:text-primary light:text-accent", isRolling && animationClass)}>
                {diceIcons[result - 1] || diceIcons[0]}
            </div>
        );
    }
    
    // Fallback for other dice types
    return (
      <div className={cn(
        "flex items-center justify-center w-32 h-32 bg-muted/80 border-2 border-accent rounded-lg text-accent",
        isRolling && animationClass
      )}>
        <span className="text-5xl font-bold">{result}</span>
      </div>
    );
};


export default function DiceRoller() {
  const [numberOfDice, setNumberOfDice] = useState("1");
  const [diceType, setDiceType] = useState("6");
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate-spin-dice");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handleRoll = () => {
    if (isRolling) return;
    triggerRateLimit();
    setIsRolling(true);
    setIsCopied(false);
    
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    setAnimationClass(randomAnimation);

    const numDice = parseInt(numberOfDice, 10);
    const numSides = parseInt(diceType, 10);
    const newResults: number[] = [];
    for (let i = 0; i < numDice; i++) {
      newResults.push(Math.floor(Math.random() * numSides) + 1);
    }

    setTimeout(() => {
      setResults(newResults);
      setIsRolling(false);
    }, 1000); // Duration of the animation
  };

  const total = results.reduce((sum, val) => sum + val, 0);
  const numDice = parseInt(numberOfDice, 10);
  const numSides = parseInt(diceType, 10);

  const displayArray: number[] = isRolling
    ? Array.from({ length: numDice }).map(() => Math.floor(Math.random() * numSides) + 1)
    : results.length > 0
      ? results
      : [numSides];

  const handleCopy = () => {
    if (results.length === 0) return;
    const resultString = `Total: ${total} (Rolls: ${results.join(", ")})`;
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Dice roll result copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Dice Roller</CardTitle>
        <CardDescription>
          Roll one or more dice and see the result.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="dice-type">Dice Type</Label>
            <Select
              value={diceType}
              onValueChange={setDiceType}
              disabled={isRolling || isRateLimited}
            >
              <SelectTrigger id="dice-type" className="w-28">
                <SelectValue placeholder="D6" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">D4</SelectItem>
                <SelectItem value="6">D6</SelectItem>
                <SelectItem value="8">D8</SelectItem>
                <SelectItem value="10">D10</SelectItem>
                <SelectItem value="12">D12</SelectItem>
                <SelectItem value="20">D20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="num-dice">Number of Dice</Label>
            <Select
              value={numberOfDice}
              onValueChange={setNumberOfDice}
              disabled={isRolling || isRateLimited}
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
        </div>
        <div className="flex flex-col p-8 bg-muted/50 rounded-lg relative">
          <div className="absolute top-2 right-2">
            <Button variant="ghost" size="icon" onClick={handleCopy} disabled={isRolling || results.length === 0}>
              {isCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex justify-center items-center min-h-[120px] gap-4 flex-wrap">
            {displayArray.map((result, i) => (
               <DiceDisplay key={i} type={numSides} result={result} isRolling={isRolling} animationClass={animationClass}/>
            ))}
          </div>
          {!isRolling && results.length > 0 && (
            <div className="text-center relative mt-6">
              <p className="text-lg font-bold">Total: {total}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRoll}
          disabled={isRolling || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRolling
            ? "Rolling..."
            : isRateLimited
              ? "Please wait..."
              : "Roll Dice!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
