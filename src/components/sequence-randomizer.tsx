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
import { Wand2, Copy, Check, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { randomizeSequence } from "@/app/actions/sequence-randomizer-action";
import { useSettings } from "@/context/SettingsContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";
import { threwConfetti } from "@/lib/confetti";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { PresetManager } from "./preset-manager";
import type { SequencePresetParams } from "@/types/presets";

type Item = {
  id: string;
  value: string;
};

const initialItems: Item[] = [
  { id: "1", value: "Participant 1" },
  { id: "2", value: "Participant 2" },
  { id: "3", value: "Participant 3" },
  { id: "4", value: "Participant 4" },
  { id: "5", value: "Participant 5" },
  { id: "6", value: "Participant 6" },
  { id: "7", value: "Participant 7" },
];

function AnimatedResultList({
  isShuffling,
  shuffledItems,
  isResultCopied,
  handleCopyResult,
  title,
  itemClassName,
}: {
  isShuffling: boolean;
  shuffledItems: string[];
  isResultCopied: boolean;
  handleCopyResult: () => void;
  title: string;
  itemClassName?: string;
}) {
  if (isShuffling) {
    return (
      <Card className="w-full space-y-2 mt-6 border-accent border-2 shadow-lg bg-card/80">
        <CardHeader>
          <CardTitle>Shuffling...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="h-8 bg-muted rounded-md animate-pulse w-full" />
          <div className="h-8 bg-muted rounded-md animate-pulse w-full" />
          <div className="h-8 bg-muted rounded-md animate-pulse w-full" />
          <div className="h-8 bg-muted rounded-md animate-pulse w-full" />
        </CardContent>
      </Card>
    );
  }

  if (shuffledItems.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleCopyResult}>
          {isResultCopied ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2">
          {shuffledItems.map((item, index) => (
            <li key={index} className={itemClassName}>
              {item}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export default function SequenceRandomizer() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [itemsText, setItemsText] = useState(
    initialItems.map((i) => i.value).join("\n"),
  );
  const [inputMode, setInputMode] = useState<"panel" | "textarea">("panel");
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration, confettiConfig } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();

  useEffect(() => {
    if (!isShuffling) {
      stopAudio();
    }
  }, [isShuffling, stopAudio]);

  const getCurrentParams = (): SequencePresetParams => ({
    items: inputMode === 'textarea' ? itemsText : items.map(i => i.value).join('\n'),
  });

  const handleLoadPreset = (params: any) => {
    const p = params as SequencePresetParams;
    setItemsText(p.items);
    const lines = p.items.split("\n").map(l => l.trim()).filter(Boolean);
    setItems(lines.map((line, index) => ({ id: `${Date.now()}-${index}`, value: line })));
    // toast({ title: "Preset Loaded", description: "Your settings have been restored." });
  };


  const handleInputModeChange = (checked: boolean) => {
    const newMode = checked ? "textarea" : "panel";
    setInputMode(newMode);

    if (newMode === "panel" && itemsText) {
      const lines = itemsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      setItems(
        lines.map((line, index) => ({
          id: `${Date.now()}-${index}`,
          value: line,
        })),
      );
    } else if (newMode === "textarea") {
      setItemsText(items.map((p) => p.value).join("\n"));
    }
  };

  const handleShuffle = async () => {
    sendGTMEvent({
      event: "action_sequence_randomizer",
      user_email: user ? user.email : "guest",
    });

    if (isShuffling || isRateLimited) return;
    triggerRateLimit();
    playAudio();

    setIsShuffling(true);
    setShuffledItems([]);
    setIsResultCopied(false);

    const currentItems = (
      inputMode === "textarea" ? itemsText.split("\n") : items.map((i) => i.value)
    )
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (currentItems.length > 0) {
      try {
        const newShuffledItems = await randomizeSequence(currentItems);
        setTimeout(() => {
          setShuffledItems(newShuffledItems);
          setIsShuffling(false);
          if (confettiConfig.enabled) {
            threwConfetti({
              particleCount: confettiConfig.particleCount,
              spread: confettiConfig.spread,
            });
          }
        }, animationDuration * 1000);
      } catch (e) {
        setIsShuffling(false);
      }
    } else {
      setIsShuffling(false);
    }
  };

  const handleCopyResult = () => {
    const resultString = shuffledItems
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n");
    navigator.clipboard.writeText(resultString);
    setIsResultCopied(true);
    toast({
      title: "Copied!",
      description: "Shuffled sequence copied to clipboard.",
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
        <CardTitle>Sequence Randomizer</CardTitle>
        <CardDescription>
          Enter a list of items to shuffle their order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PresetManager
          toolId="sequence"
          currentParams={getCurrentParams()}
          onLoadPreset={handleLoadPreset}
        />

        <div className="flex items-center space-x-2">
          <Switch
            id="input-mode-seq"
            checked={inputMode === "textarea"}
            onCheckedChange={handleInputModeChange}
          />
          <Label htmlFor="input-mode-seq">Use Text Area Input</Label>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="participants">List of Items</Label>
            <span className="text-xs text-muted-foreground">
              {
                (inputMode === "panel"
                  ? items.filter((i) => i.value.trim())
                  : itemsText.split("\n").filter(Boolean)
                ).length
              }{" "}
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
            <div className="mt-1 space-y-2">
              <div className="space-y-2 p-4 border rounded-md max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Enter an item"
                      value={item.value}
                      onChange={(e) =>
                        handleItemChange(item.id, e.target.value)
                      }
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
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                disabled={isShuffling}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
          )}
        </div>

        {(isShuffling || shuffledItems.length > 0) && (
          <AnimatedResultList
            isShuffling={isShuffling}
            shuffledItems={shuffledItems}
            isResultCopied={isResultCopied}
            handleCopyResult={handleCopyResult}
            title="New Sequence"
            itemClassName="text-lg"
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleShuffle}
          disabled={isShuffling || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isShuffling
            ? "Shuffling..."
            : isRateLimited
              ? "Please wait..."
              : "Shuffle Sequence!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
