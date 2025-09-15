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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Trash2, Copy, Check, Star, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

const WHEEL_COLORS = [
  "#FFC107", "#FF9800", "#FF5722", "#F44336",
  "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
  "#2196F3", "#03A9F4", "#00BCD4", "#009688",
  "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B",
];

const getBestTextColor = (bgColor: string): string => {
  const color = bgColor.substring(1); // strip #
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128 ? "white" : "black";
};

export default function Spinner() {
  const [itemsText, setItemsText] = useState("Apple\nBanana\nOrange\nGrape");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const { toast } = useToast();

  const items = useMemo(() => itemsText.split("\n").map(i => i.trim()).filter(i => i), [itemsText]);
  const segmentAngle = 360 / items.length;

  const handleSpin = () => {
    if (items.length < 2) {
      toast({
        title: "Not enough items",
        description: "Please enter at least 2 items to spin the wheel.",
        variant: "destructive"
      });
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    setIsResultCopied(false);

    const randomAngle = Math.floor(Math.random() * 360);
    const spinCycles = 5 + Math.floor(Math.random() * 5);
    const newRotation = rotation + (360 * spinCycles) + randomAngle;
    
    setRotation(newRotation);

    setTimeout(() => {
      const finalAngle = newRotation % 360;
      const winnerIndex = Math.floor(((360 - finalAngle + segmentAngle / 2) % 360) / segmentAngle);
      const newWinner = items[winnerIndex];
      setWinner(newWinner);
      setIsSpinning(false);
    }, 5000); // Must match animation duration
  };

  const handleCopyInput = () => {
    navigator.clipboard.writeText(itemsText);
    setIsInputCopied(true);
    toast({ title: "Copied!", description: "Input list copied to clipboard." });
    setTimeout(() => setIsInputCopied(false), 2000);
  };
  
  const handleClearInput = () => {
    setItemsText("");
  };

  const handleCopyResult = () => {
    if (!winner) return;
    navigator.clipboard.writeText(winner);
    setIsResultCopied(true);
    toast({ title: "Copied!", description: "Winner copied to clipboard." });
    setTimeout(() => setIsResultCopied(false), 2000);
  };

  const conicGradient = useMemo(() => {
    if (items.length === 0) return "radial-gradient(circle, hsl(var(--muted)), hsl(var(--border)))";
    return `conic-gradient(${items.map((_, i) =>
      `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
    ).join(", ")})`;
  }, [items, segmentAngle]);

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Spinner Wheel</CardTitle>
        <CardDescription>Enter items to spin the wheel and pick a random winner.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative">
          <div className="aspect-square p-4 relative flex items-center justify-center">
              <div className="spinner-arrow absolute w-10 h-10 text-accent fill-current -top-2" />
              <div 
                className="w-full h-full rounded-full border-4 border-accent shadow-2xl overflow-hidden relative transition-transform duration-[5000ms] ease-out"
                style={{
                    background: conicGradient,
                    transform: `rotate(${rotation}deg)`
                }}
              >
                  {items.map((item, index) => {
                      const angle = segmentAngle * index + segmentAngle / 2;
                      const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
                      return (
                           <div
                            key={index}
                            className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-start"
                            style={{
                                transform: `rotate(${angle}deg)`,
                                color: getBestTextColor(color),
                            }}
                           >
                            <span 
                                className="text-center px-4 font-semibold text-lg"
                                style={{ transform: `translateX(-50%) rotate(-${segmentAngle / 2}deg) ` }}
                            >
                                {item}
                            </span>
                           </div>
                      )
                  })}
              </div>
          </div>
        </div>
        <div className="space-y-4">
           <div className="relative">
              <Label htmlFor="spinner-items">Items (one per line)</Label>
              <Textarea
                id="spinner-items"
                placeholder={"Enter items, one per line..."}
                rows={8}
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                className="resize-none pr-20 mt-1.5"
                disabled={isSpinning}
              />
              <div className="absolute top-8 right-2 flex flex-col gap-2">
                <Button variant="ghost" size="icon" onClick={handleCopyInput}>
                  {isInputCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClearInput}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {winner && !isSpinning && (
                 <Card className="bg-card/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xl">Winner!</CardTitle>
                       <Button variant="ghost" size="icon" onClick={handleCopyResult}>
                          {isResultCopied ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </Button>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold text-accent">{winner}</p>
                  </CardContent>
                 </Card>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isSpinning ? "Spinning..." : "Spin the Wheel!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
