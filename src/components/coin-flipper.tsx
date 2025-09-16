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
import { useToast } from "@/hooks/use-toast";
import { HeadsIcon } from "./icons/heads-icon";
import { TailsIcon } from "./icons/tails-icon";

type CoinResult = "Heads" | "Tails";

export default function CoinFlipper() {
  const [numberOfCoins, setNumberOfCoins] = useState("1");
  const [results, setResults] = useState<CoinResult[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleFlip = () => {
    setIsFlipping(true);
    setIsCopied(false);
    
    const numCoins = parseInt(numberOfCoins, 10);
    const newResults: CoinResult[] = [];
    for (let i = 0; i < numCoins; i++) {
      newResults.push(Math.random() < 0.5 ? "Heads" : "Tails");
    }
    
    setTimeout(() => {
        setResults(newResults);
        setIsFlipping(false);
    }, 1000); // Animation duration
  };
  
  const headsCount = results.filter(r => r === "Heads").length;
  const tailsCount = results.filter(r => r === "Tails").length;
  
  const handleCopy = () => {
    if (results.length === 0) return;
    const resultString = `Heads: ${headsCount}, Tails: ${tailsCount}\nDetails: ${results.join(", ")}`;
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Coin flip result copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Coin Flipper</CardTitle>
        <CardDescription>
          Flip one or more coins and see the result.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="num-coins">Number of Coins</Label>
          <Select
            value={numberOfCoins}
            onValueChange={setNumberOfCoins}
            disabled={isFlipping}
          >
            <SelectTrigger id="num-coins" className="w-24">
              <SelectValue placeholder="1" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(10)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center items-center min-h-[120px] gap-8 flex-wrap">
          {(isFlipping ? Array(parseInt(numberOfCoins, 10)).fill(null) : results).map((result, i) => (
             <div key={i} className={`coin ${isFlipping ? 'flipping' : ''}`}>
                <div className="coin-inner">
                    <div className="coin-front">
                        {result === "Heads" ? <HeadsIcon /> : <TailsIcon />}
                    </div>
                    <div className="coin-back">
                        {/* Show the opposite for the back during flip */}
                        {result === "Heads" ? <TailsIcon /> : <HeadsIcon />}
                    </div>
                </div>
            </div>
          ))}
        </div>
         {!isFlipping && results.length > 0 && (
          <div className="text-center relative pt-4">
            <p className="text-lg font-bold">
              Heads: {headsCount}, Tails: {tailsCount}
            </p>
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
          onClick={handleFlip}
          disabled={isFlipping}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isFlipping ? "Flipping..." : "Flip Coins!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
