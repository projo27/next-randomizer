
"use client";

import { useState, useEffect, useRef } from "react";
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
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";

type RpsResult = "Rock" | "Paper" | "Scissors";
const MOVES: RpsResult[] = ["Rock", "Paper", "Scissors"];
const EMOJIS: Record<RpsResult, string> = {
  Rock: "✊",
  Paper: "🖐️",
  Scissors: "✌️",
};
const EMOJI_VALUES = Object.values(EMOJIS);

export default function RockPaperScissors() {
  const [numberOfPlays, setNumberOfPlays] = useState("1");
  const [results, setResults] = useState<RpsResult[]>([]);
  const [displayEmojis, setDisplayEmojis] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      stopAudio();
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const handlePlay = async () => {
    sendGTMEvent({
      event: "action_rock_paper_scissor_randomizer",
      user_email: user ? user.email : "guest",
    });
    if (isPlaying || isRateLimited) return;
    triggerRateLimit();
    playAudio();

    setIsPlaying(true);
    setIsCopied(false);
    setResults([]);

    const numPlays = parseInt(numberOfPlays, 10);
    
    // Start shuffling animation
    animationIntervalRef.current = setInterval(() => {
        const tempEmojis = Array.from({ length: numPlays }, () => 
            EMOJI_VALUES[Math.floor(Math.random() * EMOJI_VALUES.length)]
        );
        setDisplayEmojis(tempEmojis);
    }, 100);

    try {
      const finalResults = await playRps(numPlays);

      setTimeout(() => {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
        }
        setResults(finalResults);
        setDisplayEmojis(finalResults.map(r => EMOJIS[r]));
        setIsPlaying(false);
      }, animationDuration * 1000);

    } catch (e) {
      console.error(e);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      setIsPlaying(false);
    }
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
  
  useEffect(() => {
    setDisplayEmojis(Array(parseInt(numberOfPlays, 10)).fill(EMOJI_VALUES[0]));
    setResults([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfPlays]);

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
            onValueChange={setNumberOfPlays}
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
          {displayEmojis.length > 0 ? (
            <>
              {displayEmojis.map((emoji, i) => (
                <div key={i} className="text-7xl">
                  {emoji}
                </div>
              ))}
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

