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
import { Input } from "@/components/ui/input";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const EMOJI_LIST = [
  '😀', '😂', '😍', '🤔', '😎', '😭', '😡', '🤯', '🥳', '😴',
  '👍', '👎', '❤️', '🔥', '⭐', '🚀', '🎉', '💡', '💯', '🙏',
  '🍎', '🍌', '🍕', '🍔', '🍦', '🍓', '🥑', '🌮', '☕', '🍺',
  '🐶', '🐱', '🦄', '🐼', '🦊', '🐙', '🐵', '🦁', '🐸', '🦋',
  '⚽', '🏀', '🎸', '💻', '📱', '💰', '🎁', '📚', '🎨', '✈️',
];

export default function EmojiGenerator() {
  const [count, setCount] = useState("5");
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = () => {
    setError(null);
    setIsGenerating(true);
    setIsCopied(false);
    setResult(null);

    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount <= 0 || numCount > 50) {
      setError("Please enter a number between 1 and 50.");
      setIsGenerating(false);
      return;
    }

    let generated = "";
    for (let i = 0; i < numCount; i++) {
      generated += EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
    }
    
    // Animation effect
    const interval = setInterval(() => {
        let tempResult = "";
        for (let i = 0; i < numCount; i++) {
            tempResult += EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
        }
        setResult(tempResult);
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        setResult(generated);
        setIsGenerating(false);
    }, 1000);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Emojis copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Emoji Generator</CardTitle>
        <CardDescription>
          Generate a random sequence of fun emojis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
            <Label htmlFor="emoji-count">Number of Emojis</Label>
            <Input
              id="emoji-count"
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-20"
              disabled={isGenerating}
            />
          </div>
        
        {(result || isGenerating) && (
            <div className="relative min-h-[60px] flex items-center justify-center bg-muted/50 rounded-lg p-4">
                <p className="text-4xl tracking-widest text-accent select-all">
                    {result}
                </p>
                 {result && !isGenerating && (
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
            </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Emojis"}
        </Button>
      </CardFooter>
    </Card>
  );
}
