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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Copy, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AnimatedResultList from "./animated-result-list";
import { useRateLimiter } from "@/hooks/use-rate-limiter";

// Fisher-Yates (aka Knuth) Shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SequenceRandomizer() {
  const [itemsText, setItemsText] = useState(`Participant 1
Participant 2
Participant 3
Participant 4`);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handleShuffle = () => {
    triggerRateLimit();
    setIsShuffling(true);
    setShuffledItems([]);
    const currentItems = itemsText
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (currentItems.length > 0) {
      const newShuffledItems = shuffleArray(currentItems);
      // Fake delay for animation effect
      setTimeout(() => {
        setShuffledItems(newShuffledItems);
        setIsShuffling(false);
        setIsResultCopied(false);
      }, 500);
    } else {
      setIsShuffling(false);
    }
  };

  const handleCopyInput = () => {
    navigator.clipboard.writeText(itemsText);
    setIsInputCopied(true);
    toast({
      title: "Copied!",
      description: "Input list copied to clipboard.",
    });
    setTimeout(() => setIsInputCopied(false), 2000);
  };

  const handleClearInput = () => {
    setItemsText("");
  };

  const handleCopyResult = () => {
    const resultString = shuffledItems
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n");
    navigator.clipboard.writeText(resultString);
    setIsResultCopied(true);
    toast({
      title: "Copied!",
      description: "Shuffled sequence copied to clipboard.",
    });
    setTimeout(() => setIsResultCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Sequence Randomizer</CardTitle>
        <CardDescription>
          Enter a list of items to shuffle their order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Textarea
            placeholder="Enter items, one per line..."
            rows={8}
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            className="resize-none pr-20"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopyInput}>
              {isInputCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClearInput}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {(isShuffling || shuffledItems.length > 0) && (
          <AnimatedResultList
            isShuffling={isShuffling}
            shuffledItems={shuffledItems}
            isResultCopied={isResultCopied}
            handleCopyResult={handleCopyResult}
            title="New Sequence"
            itemClassName="text-lg"
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleShuffle}
          disabled={isShuffling || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isShuffling ? "Shuffling..." : isRateLimited ? "Please wait..." : "Shuffle Sequence!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
