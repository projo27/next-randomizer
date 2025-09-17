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
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HeadsIcon } from "./icons/heads-icon";
import { TailsIcon } from "./icons/tails-icon";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { cn } from "@/lib/utils";

type CoinSide = "Heads" | "Tails";

export default function CoinFlipper() {
  const [result, setResult] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [previousResult, setPreviousResult] = useState<CoinSide>("Heads");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handleFlip = () => {
    if (isFlipping) return;
    triggerRateLimit();
    setIsFlipping(true);
    setIsCopied(false);
    if(result) {
        setPreviousResult(result);
    }
    
    const newResult: CoinSide = Math.random() < 0.5 ? "Heads" : "Tails";

    setTimeout(() => {
      setResult(newResult);
      setIsFlipping(false);
    }, 1000); // Animation duration
  };
  
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentDisplay = result || "Heads";
  const previousDisplay = previousResult || "Tails";

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Coin Flipper</CardTitle>
        <CardDescription>
          Flip a coin to get Heads or Tails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex justify-center items-center min-h-[160px] p-4 bg-muted/50 rounded-lg">
            <div className={cn("coin", isFlipping && "flipping")}>
                <div className="coin-inner">
                    <div className="coin-front">
                        {currentDisplay === 'Heads' ? <HeadsIcon /> : <TailsIcon />}
                    </div>
                    <div className="coin-back">
                        {previousDisplay === 'Heads' ? <HeadsIcon /> : <TailsIcon />}
                    </div>
                </div>
            </div>
        </div>

        {result && !isFlipping && (
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
          onClick={handleFlip}
          disabled={isFlipping || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isFlipping ? "Flipping..." : isRateLimited ? "Please wait..." : "Flip Coin"}
        </Button>
      </CardFooter>
    </Card>
  );
}
