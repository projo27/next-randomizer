
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
import { Wand2, Copy, Check, FlameKindling, HelpCircle, Bomb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { getRandomTruthOrDare } from "@/app/actions/truth-or-dare-action";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";
import { useSettings } from "@/context/SettingsContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";

type QuestionType = "truth" | "dare";

const LOADING_TEXTS = [
  "Thinking of a juicy question...",
  "Searching for a wicked dare...",
  "Consulting the book of secrets...",
  "Spinning the bottle...",
  "Don't chicken out...",
  "Prepare yourself...",
  "Let's see what we've got...",
];

export default function TruthOrDareRandomizer() {
  const [result, setResult] = useState<string | null>(null);
  const [displayResult, setDisplayResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<QuestionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  const { animationDuration } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoading) {
      stopAudio();
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    }
  }, [isLoading, stopAudio]);

  const handleRandomize = async (type: QuestionType | "random") => {
    sendGTMEvent({ event: "action_truth_or_dare", user_email: user?.email ?? "guest" });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    playAudio();

    setIsLoading(true);
    setError(null);
    setResult(null);
    setDisplayResult(null);
    setIsCopied(false);

    const finalType = type === "random" ? (Math.random() < 0.5 ? "truth" : "dare") : type;
    setResultType(finalType);

    animationIntervalRef.current = setInterval(() => {
      setDisplayResult(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
    }, 150);

    try {
      const response = await getRandomTruthOrDare(finalType);
      
      setTimeout(() => {
        if(animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        setResult(response);
        setDisplayResult(response);
        setIsLoading(false);
      }, animationDuration * 1000);

    } catch (err: any) {
      if(animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      setError(err.message || "An unexpected error occurred.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Truth or Dare Randomizer</CardTitle>
        <CardDescription>
          Get a random question or a challenging dare for your game.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px] flex items-center justify-center p-4">
        {(isLoading || displayResult) && (
          <div className="relative w-full text-center p-4 space-y-4 animate-fade-in">
            {resultType && (
              <h3 className="text-xl md:text-2xl font-bold text-primary">
                {resultType === "truth" ? "Truth" : "Dare"}
              </h3>
            )}
            <p className="text-lg md:text-xl italic">"{displayResult}"</p>
            {result && !isLoading && (
               <div className="absolute -top-2 right-0">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            )}
          </div>
        )}
        {!isLoading && !displayResult && !error && (
          <div className="text-center text-muted-foreground">
            <FlameKindling className="h-12 w-12 mx-auto mb-4" />
            <p>Choose your fate: Truth or Dare?</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Oops!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Button
          onClick={() => handleRandomize("truth")}
          disabled={isLoading || isRateLimited}
          className="w-full"
          variant="outline"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Random Truth
        </Button>
        <Button
          onClick={() => handleRandomize("dare")}
          disabled={isLoading || isRateLimited}
          className="w-full"
          variant="destructive"
        >
          <Bomb className="mr-2 h-4 w-4" />
          Random Dare
        </Button>
        <Button
          onClick={() => handleRandomize("random")}
          disabled={isLoading || isRateLimited}
          className="w-full md:col-span-2 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Randomize (Truth or Dare)
        </Button>
      </CardFooter>
    </Card>
  );
}
