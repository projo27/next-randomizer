
"use client";

import { useState, useEffect, useRef } from "react";
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
import { Wand2, Copy, Check, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Switch } from "./ui/switch";
import { randomizeList } from "@/app/actions/list-randomizer-action";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/SettingsContext";

type Item = {
  id: string;
  value: string;
};

const initialItems: Item[] = [
  { id: "1", value: "Apple" },
  { id: "2", value: "Banana" },
  { id: "3", value: "Orange" },
  { id: "4", value: "Grape" },
  { id: "5", value: "Stawberry" },
  { id: "6", value: "Mango" },
  { id: "7", value: "Kiwi" },
  { id: "8", value: "Cherry" },
  { id: "9", value: "Watermellon" },
  { id: "10", value: "Pineapple" },
];

function ResultDisplay({
  isShuffling,
  result,
  onCopy,
  isCopied,
}: {
  isShuffling: boolean;
  result: string[] | null;
  onCopy: () => void;
  isCopied: boolean;
}) {
  if (isShuffling) {
    return (
      <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
        <CardHeader>
          <CardTitle>Picking Items...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded-md animate-pulse" />
            <div className="h-6 bg-muted rounded-md animate-pulse w-5/6" />
            <div className="h-6 bg-muted rounded-md animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result || result.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {result.length > 1 ? "Randomly Picked Items" : "And the winner is..."}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCopy}>
          {isCopied ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {result.length > 1 ? (
          <ol className="list-decimal list-inside space-y-2">
            {result.map((item, index) => (
              <li key={index} className="text-lg">
                {item}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center">
            <p className="text-4xl font-bold text-accent animate-fade-in scale-110">
              {result[0]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function ListRandomizer() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [itemsText, setItemsText] = useState(
    initialItems.map((i) => i.value).join("\n"),
  );
  const [inputMode, setInputMode] = useState<"panel" | "textarea">("panel");

  const [count, setCount] = useState("1");
  const [result, setResult] = useState<string[] | null>(null);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { animationDuration } = useSettings();

  useEffect(() => {
    // Initialize audio on client side
    audioRef.current = new Audio("/musics/randomize-synth.mp3");
    audioRef.current.loop = true; // Set audio to loop
  }, []);
  
  // Effect to control audio playback based on isShuffling state
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isShuffling) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error("Audio play error:", e));
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [isShuffling]);

  const handleInputModeChange = (checked: boolean) => {
    const newMode = checked ? "textarea" : "panel";
    setInputMode(newMode);

    if (newMode === "panel" && itemsText) {
      const lines = itemsText.split("\n").map(l => l.trim()).filter(Boolean);
      setItems(lines.map((line, index) => ({ id: `${Date.now()}-${index}`, value: line })));
    } else if (newMode === 'textarea') {
      setItemsText(items.map((p) => p.value).join("\n"));
    }
  };

  const handleRandomize = async () => {
    triggerRateLimit();
    setError(null);
    setResult(null);
    setIsResultCopied(false);

    const currentItems = (inputMode === "textarea"
      ? itemsText.split("\n")
      : items.map((i) => i.value)
    ).map((c) => c.trim()).filter(Boolean);

    const numToPick = parseInt(count, 10);
    const uniqueOptions = Array.from(new Set(currentItems));

    if (uniqueOptions.length === 0) {
      setError("Please enter at least one item in the list.");
      return;
    }
    if (isNaN(numToPick) || numToPick <= 0) {
      setError("Please enter a valid number of items to pick (must be > 0).");
      return;
    }
    if (uniqueOptions.length < numToPick) {
      setError(`Not enough unique options to pick ${numToPick}. Please add more.`);
      return;
    }

    setIsShuffling(true);

    try {
      const serverResult = await randomizeList(uniqueOptions, numToPick);
      
      console.log(animationDuration);

      // Delay setting the result and stopping the shuffle based on context duration
      setTimeout(() => {
        setResult(serverResult);
        setIsShuffling(false);
      }, animationDuration * 1000);

    } catch (e: any) {
      setError(e.message);
      setIsShuffling(false); // Stop shuffling immediately on error
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const resultString = result.join("\n");
    navigator.clipboard.writeText(resultString);
    setIsResultCopied(true);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    });
    setTimeout(() => setIsResultCopied(false), 2000);
  };

  const handleAddItem = () => {
    setItems([...items, { id: `${Date.now()}`, value: "" }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((p) => p.id !== id));
  };

  const handleItemChange = (id: string, value: string) => {
    setItems(items.map((p) => (p.id === id ? { ...p, value } : p)));
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>List Randomizer</CardTitle>
        <CardDescription>
          Enter your choices below, one per line. We'll pick one or more for
          you!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="input-mode"
            checked={inputMode === "textarea"}
            onCheckedChange={handleInputModeChange}
          />
          <Label htmlFor="input-mode">Use Text Area Input</Label>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="participants">List of Items</Label>
            <span className="text-xs text-muted-foreground">
              {(inputMode === "panel"
                ? items.filter(i => i.value.trim())
                : itemsText.split("\n").filter(Boolean)
              ).length}{" "}
              item(s)
            </span>
          </div>

          {inputMode === "textarea" ? (
            <Textarea
              id="participants-text"
              placeholder={initialItems.map((i) => i.value).join("\n")}
              rows={8}
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              className="resize-none mt-1"
              disabled={isShuffling}
            />
          ) : (
            <div className="space-y-2 mt-1 p-4 border rounded-md max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    placeholder="Enter an item"
                    value={item.value}
                    onChange={(e) => handleItemChange(item.id, e.target.value)}
                    className="flex-grow"
                    disabled={isShuffling}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isShuffling}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                disabled={isShuffling}
                className="mt-2 w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
          )}
        </div>

        <div className="grid w-1/2 max-w-1/2 items-center gap-1.5">
          <Label htmlFor="num-items">Number of Items to Pick</Label>
          <Input
            id="num-items"
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
        
        <ResultDisplay 
            isShuffling={isShuffling}
            result={result}
            onCopy={handleCopyResult}
            isCopied={isResultCopied}
        />

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          disabled={isRateLimited || isShuffling}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isShuffling
            ? "Picking..."
            : isRateLimited
              ? "Please wait..."
              : "Randomize!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
