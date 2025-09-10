"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AnimatedResultProps {
  result: string | number | null;
  options?: (string | number)[];
  duration?: number;
}

export default function AnimatedResult({
  result,
  options,
  duration = 2000,
}: AnimatedResultProps) {
  const [displayValue, setDisplayValue] = useState<string | number | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (result === null) {
      setDisplayValue(null);
      return;
    }

    setIsAnimating(true);
    setDisplayValue("...");
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

  if (result === null) {
    return null;
  }

  return (
    <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            And the winner is...
          </p>
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
