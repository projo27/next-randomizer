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
import { rollDice } from "@/app/actions/dice-roller-action";
import { useSettings } from "@/context/SettingsContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";

const diceIcons = [
  <Dice1 key={1} className="h-32 w-32" />,
  <Dice2 key={2} className="h-32 w-32" />,
  <Dice3 key={3} className="h-32 w-32" />,
  <Dice4 key={4} className="h-32 w-32" />,
  <Dice5 key={5} className="h-32 w-32" />,
  <Dice6 key={6} className="h-32 w-32" />,
];

const DiceDisplay = ({
  type,
  result,
  isRolling,
  animationDuration,
}: {
  type: number;
  result: number;
  isRolling: boolean;
  animationDuration: number;
}) => {
  if (type === 6) {
    const iconToShow = isRolling
      ? diceIcons[0]
      : diceIcons[result - 1] || diceIcons[0];
    return (
      <div
        className={cn(
          "dark:text-primary light:text-accent",
          isRolling && "animate-spin-dice",
        )}
        style={{
          animationDuration: isRolling ? `${animationDuration}s` : undefined,
          animationTimingFunction: "ease-out",
        }}
      >
        {iconToShow}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center w-32 h-32 bg-muted/80 border-2 border-accent rounded-lg text-accent",
        isRolling && "animate-spin-dice",
      )}
      style={{
        animationDuration: isRolling ? `${animationDuration}s` : undefined,
        animationTimingFunction: "ease-out",
      }}
    >
      <span className="text-5xl font-bold">{isRolling ? "?" : result}</span>
    </div>
  );
};

export default function DiceRoller() {
  const [numberOfDice, setNumberOfDice] = useState("1");
  const [diceType, setDiceType] = useState("6");
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();

  useEffect(() => {
    if (!isRolling) {
      stopAudio();
    }
  }, [isRolling, stopAudio]);

  const handleRoll = async () => {
    sendGTMEvent({
      event: "action_dice_roller",
      user_email: user ? user.email : "guest",
    });
    if (isRolling || isRateLimited) return;
    triggerRateLimit();
    playAudio();

    setIsRolling(true);
    setIsCopied(false);

    const numDice = parseInt(numberOfDice, 10);
    const numSides = parseInt(diceType, 10);

    try {
      const newResults = await rollDice(numDice, numSides);
      setTimeout(() => {
        setResults(newResults);
        setIsRolling(false);
      }, animationDuration * 1000);
    } catch (e) {
      setIsRolling(false);
    }
  };

  const total = results.reduce((sum, val) => sum + val, 0);
  const numDice = parseInt(numberOfDice, 10);
  const numSides = parseInt(diceType, 10);

  const displayArray: number[] = isRolling
    ? Array.from({ length: numDice }).map(() => 1)
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={isRolling || results.length === 0}
            >
              {isCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex justify-center items-center min-h-[120px] gap-4 flex-wrap">
            {displayArray.map((result, i) => (
              <DiceDisplay
                key={i}
                type={numSides}
                result={result}
                isRolling={isRolling}
                animationDuration={animationDuration}
              />
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
