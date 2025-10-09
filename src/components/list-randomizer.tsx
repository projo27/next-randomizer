
"use client";

import { useState, useEffect } from "react";
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
import AnimatedResult from "./animated-result";
import { Wand2, Copy, Check, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import AnimatedResultList from "./animated-result-list";
import { Switch } from "./ui/switch";
import { randomizeList } from "@/app/actions/list-randomizer-action";

type Item = {
  id: string;
  value: string;
};

const initialItems: Item[] = [
    { id: '1', value: 'Apples' },
    { id: '2', value: 'Bananas' },
    { id: '3', value: 'Oranges' },
];

export default function ListRandomizer() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [itemsText, setItemsText] = useState(initialItems.map(i => i.value).join('\n'));
  const [inputMode, setInputMode] = useState<'panel' | 'textarea'>('panel');
  
  const [count, setCount] = useState("1");
  const [result, setResult] = useState<string[] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

   useEffect(() => {
    if (inputMode === 'textarea') {
      setItemsText(items.map(p => p.value).join('\n'));
    }
  }, [inputMode, items]);

  const handleInputModeChange = (checked: boolean) => {
    const newMode = checked ? 'textarea' : 'panel';
    setInputMode(newMode);

    if (newMode === 'panel') {
      parseItemsFromText(itemsText);
    }
  };

  const parseItemsFromText = (text: string) => {
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line);
    const newItems: Item[] = lines.map((line, index) => ({
        id: `${Date.now()}-${index}`,
        value: line
    }));
    setItems(newItems);
  };


  const handleRandomize = async () => {
    triggerRateLimit();
    setError(null);
    setResult(null);
    setIsResultCopied(false);
    
    let currentItems: string[];
    if (inputMode === 'textarea') {
        currentItems = itemsText.split("\n").map((c) => c.trim()).filter((c) => c.length > 0);
    } else {
        currentItems = items.map(i => i.value.trim()).filter(i => i.length > 0);
    }

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
    
    setOptions(uniqueOptions);

    if (numToPick === 1) {
      setIsShuffling(false);
      // Still set isShuffling to true for animation consistency on result component
      try {
        const serverResult = await randomizeList(uniqueOptions, numToPick);
        setResult(serverResult);
      } catch (e: any) {
        setError(e.message);
      }
    } else {
      setIsShuffling(true);
      try {
        const serverResult = await randomizeList(uniqueOptions, numToPick);
        // Fake delay for animation
        setTimeout(() => {
          setResult(serverResult);
          setIsShuffling(false);
        }, 500);
      } catch (e: any) {
        setError(e.message);
        setIsShuffling(false);
      }
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const resultString = Array.isArray(result) ? result.join("\n") : result[0];
    navigator.clipboard.writeText(resultString);
    setIsResultCopied(true);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    });
    setTimeout(() => setIsResultCopied(false), 2000);
  };
  
  const handleAddItem = () => {
      setItems([...items, {id: `${Date.now()}`, value: ""}]);
  }

  const handleRemoveItem = (id: string) => {
      setItems(items.filter(p => p.id !== id));
  }

  const handleItemChange = (id: string, value: string) => {
      setItems(items.map(p => p.id === id ? {...p, value} : p));
  }


  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>List Randomizer</CardTitle>
        <CardDescription>
          Enter your choices below, one per line. We'll pick one or more for you!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
            <Switch id="input-mode" checked={inputMode === 'textarea'} onCheckedChange={handleInputModeChange} />
            <Label htmlFor="input-mode">Use Text Area Input</Label>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="participants">List of Items</Label>
             <span className="text-xs text-muted-foreground">
              {inputMode === 'panel' ? items.length : itemsText.split('\n').filter(Boolean).length} item(s)
            </span>
          </div>

          {inputMode === 'textarea' ? (
              <Textarea
                id="participants-text"
                placeholder={`Apples
Bananas
Oranges`}
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
                     <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} disabled={isShuffling}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddItem} disabled={isShuffling} className="mt-2 w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
          )}
        </div>


        <div className="grid w-full max-w-xs items-center gap-1.5">
          <Label htmlFor="num-items">Number of Items to Pick</Label>
          <Input
            id="num-items"
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
        {result && result.length === 1 && !isShuffling && (
          <AnimatedResult result={result[0]} options={options} handleCopyResult={handleCopyResult} />
        )}
        {(isShuffling || (result && result.length > 1)) && (
          <AnimatedResultList
            isShuffling={isShuffling}
            shuffledItems={Array.isArray(result) ? result : []}
            isResultCopied={isResultCopied}
            handleCopyResult={handleCopyResult}
            title="Randomly Picked Items"
            itemClassName="text-lg"
          />
        )}
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
          {isShuffling ? "Picking..." : isRateLimited ? "Please wait..." : "Randomize!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
