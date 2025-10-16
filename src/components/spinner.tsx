"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Wand2, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import dynamic from "next/dynamic";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { getSpinnerWinner } from "@/app/actions/spinner-action";
import { useSettings } from "@/context/SettingsContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading wheel...</p>
      </div>
    ),
  },
);

const WHEEL_COLORS = [
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
];

const getBestTextColor = (bgColor: string): string => {
  const color = bgColor.substring(1);
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128 ? "white" : "black";
};

const DEFAULT_LIST = [
  "Apple",
  "Banana",
  "Orange",
  "Grape",
  "Stawberry",
  "Mango",
  "Kiwi",
  "Cherry",
  "Watermellon",
  "Pineapple",
];

export default function Spinner() {
  const [itemsText, setItemsText] = useState(DEFAULT_LIST.join("\n"));
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5500);
  const { animationDuration } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();

  useEffect(() => {
    if (!mustSpin) {
      stopAudio();
    }
  }, [mustSpin, stopAudio]);

  const items = useMemo(
    () =>
      itemsText
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i),
    [itemsText],
  );

  const data = useMemo(() => {
    if (items.length === 0) return [{ option: "Empty" }];
    return items.map((item) => ({ option: item }));
  }, [items]);

  const handleSpin = async () => {
    if (items.length < 2) {
      toast({
        title: "Not enough items",
        description: "Please enter at least 2 items to spin the wheel.",
        variant: "destructive",
      });
      return;
    }
    if (mustSpin) return;
    triggerRateLimit();
    playAudio();
    setWinner(null);
    setIsResultCopied(false);

    const newWinner = await getSpinnerWinner(items);

    if (!mustSpin) {
      const winnerIndex = items.indexOf(newWinner!);
      setPrizeNumber(winnerIndex);
      setMustSpin(true);
    }
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

  const isSpinning = mustSpin || isRateLimited;

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Spinner Wheel</CardTitle>
        <CardDescription>
          Enter items to spin the wheel and pick a random winner.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-[1fr_1fr] gap-4 items-center h-full">
        <div className="relative">
          <div className="aspect-square relative flex items-center justify-center w-full h-full">
            <div className="rotate-[-45deg]">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={data.map((item, index) => ({
                  ...item,
                  style: {
                    backgroundColor: WHEEL_COLORS[index % WHEEL_COLORS.length],
                    textColor: getBestTextColor(
                      WHEEL_COLORS[index % WHEEL_COLORS.length],
                    ),
                  },
                }))}
                onStopSpinning={() => {
                  setMustSpin(false);
                  setWinner(items[prizeNumber]);
                }}
                outerBorderColor="#d1d5db"
                radiusLineColor="#d1d5db"
                fontSize={16}
                spinDuration={animationDuration * 0.1}
                pointerProps={{
                  style: {
                    color: "#fffff",
                    transform: "rotate(0deg) scale(0.8) translate(-20px, 0)",
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 flex flex-col h-full py-6">
          <div className="relative h-2/3 mb-8">
            <Label htmlFor="spinner-items">Items (one per line)</Label>
            <Textarea
              id="spinner-items"
              placeholder={"Enter items, one per line..."}
              rows={8}
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              className="resize-none pr-20 mt-1.5 h-full"
              disabled={isSpinning}
            />
            <div className="absolute top-10 right-2 flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyInput}
                disabled={isSpinning}
              >
                {isInputCopied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearInput}
                disabled={isSpinning}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {winner && !mustSpin && (
            <Card className="bg-card/80 h-1/3 border-accent border-2 ">
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                <CardTitle className="text-xl">Winner!</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyResult}
                  className="top-2 right-2 absolute"
                >
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
          {mustSpin
            ? "Spinning..."
            : isRateLimited
            ? "Please wait..."
            : "Spin the Wheel!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
