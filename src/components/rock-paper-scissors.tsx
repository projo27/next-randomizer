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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { cn } from "@/lib/utils";

type RpsResult = "Batu" | "Gunting" | "Kertas";
const MOVES: RpsResult[] = ["Batu", "Gunting", "Kertas"];
const EMOJIS: Record<RpsResult, string> = {
  Batu: "✊",
  Gunting: "✌️",
  Kertas: "🖐️",
};

export default function RockPaperScissors() {
  const [numberOfPlays, setNumberOfPlays] = useState("1");
  const [results, setResults] = useState<RpsResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handlePlay = () => {
    if (isPlaying) return;
    triggerRateLimit();
    setIsPlaying(true);
    setIsCopied(false);
    setResults([]);

    const numPlays = parseInt(numberOfPlays, 10);
    const newResults: RpsResult[] = [];
    for (let i = 0; i < numPlays; i++) {
      newResults.push(MOVES[Math.floor(Math.random() * MOVES.length)]);
    }

    setTimeout(() => {
      setResults(newResults);
      setIsPlaying(false);
    }, 1000); // Animation duration
  };
  
  const handleCopy = () => {
    if (results.length === 0) return;
    const resultString = results.join(", ");
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Hasil permainan disalin ke clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Batu Gunting Kertas</CardTitle>
        <CardDescription>
          Dapatkan hasil acak untuk permainan Batu, Gunting, Kertas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="num-plays">Jumlah Permainan</Label>
          <Select
            value={numberOfPlays}
            onValueChange={setNumberOfPlays}
            disabled={isPlaying || isRateLimited}
          >
            <SelectTrigger id="num-plays" className="w-24">
              <SelectValue placeholder="1" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(10)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center items-center min-h-[160px] gap-8 flex-wrap p-4 bg-muted/50 rounded-lg">
          {isPlaying &&
            Array.from({ length: parseInt(numberOfPlays, 10) }).map((_, i) => (
              <div key={i} className="text-7xl animate-pulse">
                {EMOJIS[MOVES[i % 3]]}
              </div>
            ))}
          {!isPlaying && results.length > 0 && (
             <div className="relative w-full">
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    {results.map((result, i) => (
                        <div key={i} className="text-7xl animate-reveal-card" style={{ animationDelay: `${i * 100}ms`}}>
                            {EMOJIS[result]}
                        </div>
                    ))}
                </div>
                 <div className="absolute -top-4 -right-2">
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                      {isCopied ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                </div>
            </div>
          )}
           {!isPlaying && results.length === 0 && (
                <p className="text-muted-foreground">Hasil permainan akan muncul di sini.</p>
           )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePlay}
          disabled={isPlaying || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isPlaying ? "Bermain..." : isRateLimited ? "Tunggu sebentar..." : "Mainkan!"}
        </Button>
      </CardFooter>
    </Card>
  );
}