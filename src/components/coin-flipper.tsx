
"use client";

import { useState, useRef, useEffect } from "react";
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
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { flipCoins } from "@/app/actions/coin-flipper-action";
import { useSettings } from "@/context/SettingsContext";

type CoinResult = "Heads" | "Tails";

export default function CoinFlipper() {
  const [numberOfCoins, setNumberOfCoins] = useState("1");
  const [results, setResults] = useState<CoinResult[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/musics/randomize-synth.mp3");
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isFlipping) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isFlipping]);

  const handleFlip = async () => {
    if (isFlipping || isRateLimited) return;
    triggerRateLimit();
    setIsFlipping(true);
    setIsCopied(false);

    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
    }

    const numCoins = parseInt(numberOfCoins, 10);
    const newResults = await flipCoins(numCoins);

    setTimeout(() => {
      setResults(newResults);
      setIsFlipping(false);
    }, animationDuration * 1000);
  };

  const headsCount = results.filter((r) => r === "Heads").length;
  const tailsCount = results.filter((r) => r === "Tails").length;
  const numCoins = parseInt(numberOfCoins, 10);
  const displayArray: (CoinResult | null)[] = isFlipping
    ? Array(numCoins).fill(null)
    : results.length
    ? results
    : ["Heads"];

  const handleCopy = () => {
    if (results.length === 0) return;
    const resultString = `Heads: ${headsCount}, Tails: ${tailsCount}\nDetails: ${results.join(
      ", ",
    )}`;
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
            disabled={isFlipping || isRateLimited}
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
        <div className="flex flex-col p-8 bg-muted/50 rounded-lg relative">
          <div className="absolute top-2 right-2">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {isCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex justify-center items-center min-h-[240px] gap-8 flex-wrap">
            {displayArray.map((result, i) => (
              <div key={i} className="coin">
                <div 
                  className="coin-inner"
                  style={
                    isFlipping
                      ? {
                          animation: `flip-coin ${animationDuration}s ease-out forwards`,
                        }
                      : {}
                  }
                >
                  <div className="coin-front">
                    {result === "Heads" ? (
                      <HeadsIcon width={200} height={200} />
                    ) : (
                      <TailsIcon width={200} height={200} />
                    )}
                  </div>
                  <div className="coin-back">
                    {result === "Heads" ? (
                      <TailsIcon width={200} height={200} />
                    ) : (
                      <HeadsIcon width={200} height={200} />
                    )}
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
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleFlip}
          disabled={isFlipping || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isFlipping
            ? "Flipping..."
            : isRateLimited
            ? "Please wait..."
            : "Flip Coins!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
