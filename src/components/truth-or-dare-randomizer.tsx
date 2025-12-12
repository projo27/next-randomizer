
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
import { Wand2, Copy, Check, HelpCircle, Bomb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { getRandomTruthOrDare } from "@/app/actions/truth-or-dare-action";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";
import { useSettings } from "@/context/SettingsContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";
import { Separator } from "./ui/separator";
import { threwConfetti } from "@/lib/confetti";

const LOADING_TEXTS = [
  "Thinking of a juicy question...",
  "Searching for a wicked dare...",
  "Consulting the book of secrets...",
  "Spinning the bottle...",
  "Don't chicken out...",
  "Prepare yourself...",
  "Let's see what we've got...",
];

type LoadingState = {
  truth: boolean;
  dare: boolean;
};

export default function TruthOrDareRandomizer() {
  const [truthResult, setTruthResult] = useState<string | null>(null);
  const [dareResult, setDareResult] = useState<string | null>(null);
  const [displayTruth, setDisplayTruth] = useState<string | null>(null);
  const [displayDare, setDisplayDare] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<LoadingState>({ truth: false, dare: false });
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<{ truth: boolean; dare: boolean }>({ truth: false, dare: false });
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  const { animationDuration, confettiConfig } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const truthAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const dareAnimationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (truthAnimationRef.current) clearInterval(truthAnimationRef.current);
      if (dareAnimationRef.current) clearInterval(dareAnimationRef.current);
    };
  }, []);

  const handleRandomize = async (type: "truth" | "dare" | "both") => {
    sendGTMEvent({ event: "action_truth_or_dare", user_email: user?.email ?? "guest" });
    if (isLoading.truth || isLoading.dare || isRateLimited) return;

    triggerRateLimit();
    playAudio();
    setError(null);
    if (type === "truth" || type === "both") {
      setTruthResult(null);
      setIsCopied(prev => ({ ...prev, truth: false }))
      setIsLoading(prev => ({ ...prev, truth: true }));
      truthAnimationRef.current = setInterval(() => {
        setDisplayTruth(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
      }, 150);
    }
    if (type === "dare" || type === "both") {
      setDareResult(null);
      setIsCopied(prev => ({ ...prev, dare: false }));
      setIsLoading(prev => ({ ...prev, dare: true }));
      dareAnimationRef.current = setInterval(() => {
        setDisplayDare(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
      }, 150);
    }

    const performRandomization = async (t: "truth" | "dare") => {
      try {
        const response = await getRandomTruthOrDare(t);
        setTimeout(() => {
          if (t === "truth" && truthAnimationRef.current) {
            clearInterval(truthAnimationRef.current);
            setTruthResult(response);
            setDisplayTruth(response);
            setIsLoading(prev => ({ ...prev, truth: false }));
          } else if (t === "dare" && dareAnimationRef.current) {
            clearInterval(dareAnimationRef.current);
            setDareResult(response);
            setDisplayDare(response);
            setIsLoading(prev => ({ ...prev, dare: false }));
          }
        }, animationDuration * 1000);

        // Trigger confetti after delay matching animation
        setTimeout(() => {
          if (confettiConfig.enabled) {
            threwConfetti({
              particleCount: confettiConfig.particleCount,
              spread: confettiConfig.spread,
            });
          }
        }, animationDuration * 1000);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        console.error(err);
        if (t === "truth" && truthAnimationRef.current) clearInterval(truthAnimationRef.current);
        if (t === "dare" && dareAnimationRef.current) clearInterval(dareAnimationRef.current);
        setIsLoading({ truth: false, dare: false });
      }
    };

    if (type === "truth" || type === "both") {
      performRandomization("truth");
    }
    if (type === "dare" || type === "both") {
      performRandomization("dare");
    }

    // Stop audio only when all animations are done
    setTimeout(() => {
      stopAudio();
    }, animationDuration * 1000);
  };

  const handleCopy = (type: "truth" | "dare") => {
    const resultToCopy = type === "truth" ? truthResult : dareResult;
    if (!resultToCopy) return;

    navigator.clipboard.writeText(resultToCopy);
    setIsCopied({ truth: type === "truth", dare: type === "dare" });
    toast({
      title: "Copied!",
      description: `${type === "truth" ? "Truth" : "Dare"} copied to clipboard.`,
    });
    setTimeout(() => setIsCopied({ truth: false, dare: false }), 2000);
  };

  const isAnyLoading = isLoading.truth || isLoading.dare;

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Truth or Dare Randomizer</CardTitle>
        <CardDescription>Get a random question or a challenging dare for your game.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Truth Section */}
        <div className="space-y-4">
          <div className="relative min-h-[120px] flex items-center justify-center p-4 bg-muted/50 rounded-lg">
            {(isLoading.truth || displayTruth) ? (
              <div className="text-center animate-fade-in">
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">Truth</h3>
                <p className="text-lg md:text-xl italic">"{displayTruth}"</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Truth question will appear here.</p>
            )}
            {truthResult && !isLoading.truth && (
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" onClick={() => handleCopy('truth')}>
                  {isCopied.truth ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            )}
          </div>
          <Button
            onClick={() => handleRandomize("truth")}
            disabled={isAnyLoading || isRateLimited}
            className="w-full bg-primary"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Random Truth
          </Button>
        </div>

        <Separator />

        {/* Dare Section */}
        <div className="space-y-4">
          <div className="relative min-h-[120px] flex items-center justify-center p-4 bg-muted/50 rounded-lg">
            {(isLoading.dare || displayDare) ? (
              <div className="text-center animate-fade-in">
                <h3 className="text-xl md:text-2xl font-bold text-destructive dark:text-red-500 mb-2">Dare</h3>
                <p className="text-lg md:text-xl italic">"{displayDare}"</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Dare challenge will appear here.</p>
            )}
            {dareResult && !isLoading.dare && (
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" onClick={() => handleCopy('dare')}>
                  {isCopied.dare ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            )}
          </div>
          <Button
            onClick={() => handleRandomize("dare")}
            disabled={isAnyLoading || isRateLimited}
            className="w-full"
            variant="destructive"
          >
            <Bomb className="mr-2 h-4 w-4" />
            Random Dare
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Oops!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={() => handleRandomize("both")}
          disabled={isAnyLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Randomize Both
        </Button>
      </CardFooter>
    </Card>
  );
}
