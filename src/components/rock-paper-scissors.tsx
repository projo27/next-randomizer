
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
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { playRps } from "@/app/actions/rock-paper-scissors-action";
import { useSettings } from "@/context/SettingsContext";

type RpsResult = "Rock" | "Paper" | "Scissors";
const MOVES: RpsResult[] = ["Rock", "Paper", "Scissors"];
const EMOJIS: Record<RpsResult, string> = {
  Rock: "✊",
  Paper: "🖐️",
  Scissors: "✌️",
};

export default function RockPaperScissors() {
  const [numberOfPlays, setNumberOfPlays] = useState("1");
  const [results, setResults] = useState<RpsResult[]>([]);
  const [previousResults, setPreviousResults] = useState<RpsResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (audio && !isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isPlaying]);

  const handlePlay = async () => {
    if (isPlaying || isRateLimited) return;
    triggerRateLimit();
    setIsPlaying(true);
    setIsCopied(false);
    setPreviousResults(results);

    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
    }

    const numPlays = parseInt(numberOfPlays, 10);
    const newResults = await playRps(numPlays);

    setTimeout(() => {
      setResults(newResults);
      setIsPlaying(false);
    }, animationDuration * 1000);
  };

  const handleCopy = () => {
    if (results.length === 0) return;
    const resultString = results.join(", ");
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Game result copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const displayedResults = isPlaying
    ? Array(parseInt(numberOfPlays, 10)).fill(null)
    : results;

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Rock Paper Scissors</CardTitle>
        <CardDescription>
          Get a random result for a game of Rock, Paper, Scissors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="num-plays">Number of Plays</Label>
          <Select
            value={numberOfPlays}
            onValueChange={(val) => {
              setNumberOfPlays(val);
              setResults([]);
              setPreviousResults([]);
            }}
            disabled={isPlaying || isRateLimited}
          >
            <SelectTrigger id="num-plays" className="w-24">
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
        <div className="relative flex justify-center items-center min-h-[200px] gap-8 flex-wrap p-4 bg-muted/50 rounded-lg">
          {displayedResults.length > 0 ? (
            <>
              {displayedResults.map((result, i) => {
                const prevResult =
                  previousResults[i] || MOVES[Math.floor(Math.random() * 3)];
                const finalResult =
                  result || MOVES[Math.floor(Math.random() * 3)];
                return (
                  <div
                    key={i}
                    className={`coin ${isPlaying ? "flipping" : ""}`}
                  >
                    <div className="coin-inner text-7xl">
                      <div className="coin-front">
                        {EMOJIS[finalResult as RpsResult]}
                      </div>
                      <div className="coin-back">
                        {EMOJIS[prevResult as RpsResult]}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!isPlaying && results.length > 0 && (
                <div className="absolute top-2 right-2">
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {isCopied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              Your game results will appear here.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePlay}
          disabled={isPlaying || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isPlaying
            ? "Playing..."
            : isRateLimited
            ? "Please wait..."
            : "Play!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
