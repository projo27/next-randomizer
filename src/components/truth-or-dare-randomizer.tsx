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
import { Wand2, Copy, Check, FlameKindling, HelpCircle, Bomb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { getRandomTruthOrDare } from "@/app/actions/truth-or-dare-action";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";

type QuestionType = "truth" | "dare";

export default function TruthOrDareRandomizer() {
  const [result, setResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<QuestionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(2000);
  const { user } = useAuth();

  const handleRandomize = async (type: QuestionType | 'random') => {
    sendGTMEvent({ event: "action_truth_or_dare", user_email: user?.email ?? "guest" });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    const finalType = type === 'random' ? (Math.random() < 0.5 ? 'truth' : 'dare') : type;
    setResultType(finalType);

    try {
      const response = await getRandomTruthOrDare(finalType);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error(err);
    } finally {
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
        {isLoading && <Skeleton className="h-24 w-full" />}
        {!isLoading && result && (
          <div className="relative w-full text-center p-4 space-y-4 animate-fade-in">
            <h3 className="text-xl md:text-2xl font-bold text-primary">
              {resultType === 'truth' ? "Truth" : "Dare"}
            </h3>
            <p className="text-lg md:text-xl italic">"{result}"</p>
            <div className="absolute -top-2 right-0">
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}
        {!isLoading && !result && !error && (
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
          onClick={() => handleRandomize('truth')}
          disabled={isLoading || isRateLimited}
          className="w-full"
          variant="outline"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Random Truth
        </Button>
        <Button
          onClick={() => handleRandomize('dare')}
          disabled={isLoading || isRateLimited}
          className="w-full"
          variant="destructive"
        >
          <Bomb className="mr-2 h-4 w-4" />
          Random Dare
        </Button>
        <Button
          onClick={() => handleRandomize('random')}
          disabled={isLoading || isRateLimited}
          className="w-full md:col-span-2 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Randomize Both
        </Button>
      </CardFooter>
    </Card>
  );
}
