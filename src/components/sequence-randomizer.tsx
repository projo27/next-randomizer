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

  const handleShuffle = () => {
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
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleShuffle}
          disabled={isShuffling}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isShuffling ? "Shuffling..." : "Shuffle Sequence!"}
        </Button>
        {(isShuffling || shuffledItems.length > 0) && (
          <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New Sequence</CardTitle>
              {!isShuffling && (
                 <Button variant="ghost" size="icon" onClick={handleCopyResult}>
                 {isResultCopied ? (
                   <Check className="h-5 w-5 text-green-500" />
                 ) : (
                   <Copy className="h-5 w-5" />
                 )}
               </Button>
              )}
            </CardHeader>
            <CardContent>
              {isShuffling ? (
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded-md animate-pulse" />
                  <div className="h-6 bg-muted rounded-md animate-pulse w-5/6" />
                  <div className="h-6 bg-muted rounded-md animate-pulse w-3/4" />
                </div>
              ) : (
                <ol className="list-decimal list-inside space-y-2">
                  {shuffledItems.map((item, index) => (
                    <li key={index} className="text-lg">
                      {item}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        )}
      </CardFooter>
    </Card>
  );
}
