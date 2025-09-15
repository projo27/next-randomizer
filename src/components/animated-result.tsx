"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnimatedResultProps {
  result: string | number | null;
  options?: (string | number)[];
  duration?: number;
  title?: string;
  description?: string;
}

export default function AnimatedResult({
  result,
  options,
  duration = 2000,
  title = "And the winner is...",
  description,
}: AnimatedResultProps) {
  const [displayValue, setDisplayValue] = useState<string | number | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (result === null) {
      setDisplayValue(null);
      return;
    }

    setIsAnimating(true);
    setDisplayValue("...");
    setIsCopied(false);
    let animationInterval: NodeJS.Timeout;
    const animationEndTime = Date.now() + duration;

    if (options && options.length > 1) {
      // Slot machine effect
      animationInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * options.length);
        setDisplayValue(options[randomIndex]);
      }, 100);
    }

    const timeout = setTimeout(() => {
      if (animationInterval) clearInterval(animationInterval);
      setDisplayValue(result);
      setIsAnimating(false);
    }, duration);

    return () => {
      if (animationInterval) clearInterval(animationInterval);
      clearTimeout(timeout);
    };
  }, [result, options, duration]);

  const handleCopy = () => {
    if (result === null) return;
    navigator.clipboard.writeText(result.toString());
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (result === null) {
    return null;
  }

  return (
    <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {!isAnimating && (
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            {isCopied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div
            className={`text-3xl font-bold text-accent transition-transform duration-300 ease-out ${
              !isAnimating ? "scale-110" : "scale-100"
            }`}
          >
            {displayValue}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
