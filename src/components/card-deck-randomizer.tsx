"use client";

import { useState, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PlayingCard, { Card as CardType } from "./playing-card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const SUITS = ["S", "C", "H", "D"] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

function createDeck(includeJokers: boolean): CardType[] {
  const deck: CardType[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  if (includeJokers) {
    deck.push({ suit: "Joker", rank: "Joker" });
    deck.push({ suit: "Joker", rank: "Joker" });
  }
  return deck;
}

function shuffleDeck(deck: CardType[]): CardType[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function CardDeckRandomizer() {
  const [includeJokers, setIncludeJokers] = useState(false);
  const [numToDraw, setNumToDraw] = useState("3");
  const [drawnCards, setDrawnCards] = useState<CardType[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const deck = useMemo(() => createDeck(includeJokers), [includeJokers]);

  const handleDraw = () => {
    setError(null);
    setIsCopied(false);
    
    const count = parseInt(numToDraw, 10);
    if (isNaN(count) || count <= 0) {
      setError("Please enter a valid number of cards to draw.");
      return;
    }
    if (count > deck.length) {
      setError(`You can't draw more cards than are in the deck (${deck.length}).`);
      return;
    }

    setIsDrawing(true);
    setDrawnCards([]);

    const shuffledDeck = shuffleDeck(deck);
    const newDrawnCards = shuffledDeck.slice(0, count);

    setTimeout(() => {
      setDrawnCards(newDrawnCards);
      setIsDrawing(false);
    }, 1000); // Animation duration
  };
  
  const handleCopyResult = () => {
    if (drawnCards.length === 0) return;
    const resultString = drawnCards.map(c => c.rank === "Joker" ? "Joker" : `${c.rank}${c.suit}`).join(", ");
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Drawn cards copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };


  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Card Deck Randomizer</CardTitle>
        <CardDescription>
          Shuffle a deck of cards and draw a random hand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center space-x-2">
                <Switch id="include-jokers" checked={includeJokers} onCheckedChange={setIncludeJokers} disabled={isDrawing}/>
                <Label htmlFor="include-jokers">Include Jokers</Label>
            </div>
             <div className="flex items-center gap-2">
                <Label htmlFor="num-to-draw">Cards to Draw</Label>
                <Input
                id="num-to-draw"
                type="number"
                min="1"
                max={deck.length}
                value={numToDraw}
                onChange={(e) => setNumToDraw(e.target.value)}
                className="w-20"
                disabled={isDrawing}
                />
            </div>
        </div>

        <div className="flex justify-center items-center min-h-[160px] flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
            {isDrawing && (
                <div className="flex justify-center items-center h-full">
                    <p className="text-lg animate-pulse">Shuffling and Drawing...</p>
                </div>
            )}
            {!isDrawing && drawnCards.length > 0 && (
                 <div className="relative w-full">
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        {drawnCards.map((card, index) => (
                           <div key={index} className="animate-reveal-card" style={{ animationDelay: `${index * 100}ms`}}>
                             <PlayingCard suit={card.suit} rank={card.rank} />
                           </div>
                        ))}
                    </div>
                     <div className="absolute -top-4 -right-2">
                        <Button variant="ghost" size="icon" onClick={handleCopyResult}>
                        {isCopied ? (
                            <Check className="h-5 w-5 text-green-500" />
                        ) : (
                            <Copy className="h-5 w-5" />
                        )}
                        </Button>
                    </div>
                </div>
            )}
             {!isDrawing && drawnCards.length === 0 && (
                 <p className="text-muted-foreground">Your drawn cards will appear here.</p>
             )}
        </div>
         {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleDraw}
          disabled={isDrawing}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isDrawing ? "Drawing..." : "Draw Cards"}
        </Button>
      </CardFooter>
    </Card>
  );
}
