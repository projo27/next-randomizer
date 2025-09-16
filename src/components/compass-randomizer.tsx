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
import { Switch } from "@/components/ui/switch";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CompassIcon } from "./icons/compass-icon";

const DIRECTIONS: Record<string, number> = {
  "North": 0,
  "Northeast": 45,
  "East": 90,
  "Southeast": 135,
  "South": 180,
  "Southwest": 225,
  "West": 270,
  "Northwest": 315,
};

const CARDINAL_DIRECTIONS = ["North", "East", "South", "West"];
const INTERCARDINAL_DIRECTIONS = ["Northeast", "Southeast", "Southwest", "Northwest"];

export default function CompassRandomizer() {
  const [includeIntercardinal, setIncludeIntercardinal] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleRandomize = () => {
    setIsRandomizing(true);
    setResult(null);
    setIsCopied(false);

    const directions = includeIntercardinal
      ? [...CARDINAL_DIRECTIONS, ...INTERCARDINAL_DIRECTIONS]
      : CARDINAL_DIRECTIONS;
    
    const randomIndex = Math.floor(Math.random() * directions.length);
    const winner = directions[randomIndex];
    const targetRotation = DIRECTIONS[winner];

    // Add multiple spins for visual effect
    const spinCycles = 3 + Math.floor(Math.random() * 3);
    const newRotation = rotation + (360 * spinCycles) + (360 - (rotation % 360)) + targetRotation;
    
    setRotation(newRotation);

    setTimeout(() => {
      setResult(winner);
      setIsRandomizing(false);
    }, 4000); // Must match animation duration
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Direction copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Compass Randomizer</CardTitle>
        <CardDescription>
          Get a random compass direction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center justify-center space-x-2">
          <Switch 
            id="include-intercardinal" 
            checked={includeIntercardinal} 
            onCheckedChange={setIncludeIntercardinal}
            disabled={isRandomizing}
          />
          <Label htmlFor="include-intercardinal">Include Intercardinal Directions</Label>
        </div>

        <div className="relative flex justify-center items-center h-52 w-52 mx-auto">
          <CompassIcon
            className="w-full h-full text-muted-foreground transition-transform duration-[4000ms] ease-in-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </div>

        {result && !isRandomizing && (
          <div className="relative text-center">
             <h3 className="text-3xl font-bold text-accent">{result}</h3>
            <div className="absolute -top-2 right-0">
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isRandomizing}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing ? "Spinning..." : "Randomize Direction"}
        </Button>
      </CardFooter>
    </Card>
  );
}