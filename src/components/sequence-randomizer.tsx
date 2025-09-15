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
import { Wand2 } from "lucide-react";

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
  const [itemsText, setItemsText] = useState(`Peserta 1
Peserta 2
Peserta 3
Peserta 4`);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

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
      }, 500);
    } else {
      setIsShuffling(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Sequence Randomizer</CardTitle>
        <CardDescription>
          Masukkan daftar item untuk diacak urutannya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Masukkan item, satu per baris..."
          rows={8}
          value={itemsText}
          onChange={(e) => setItemsText(e.target.value)}
          className="resize-none"
        />
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleShuffle}
          disabled={isShuffling}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isShuffling ? "Mengacak..." : "Acak Urutan!"}
        </Button>
        {(isShuffling || shuffledItems.length > 0) && (
          <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
            <CardHeader>
              <CardTitle>Urutan Baru</CardTitle>
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
