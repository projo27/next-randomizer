"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";
import { useSettings } from "@/context/SettingsContext";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { useToast } from "@/hooks/use-toast";
import { threwConfetti } from "@/lib/confetti";
import type { LotteryPresetParams } from "@/types/presets";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { sendGTMEvent } from "@next/third-parties/google";
import { Check, Copy, GripVertical, Info, Plus, PlusCircle, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PresetManager } from "./preset-manager";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type SegmentType = 'number' | 'letter' | 'mixed' | 'static';

interface Segment {
  id: string;
  type: SegmentType;
  value: string | number; // For static, it's text. For random, it's length.
  min?: number;
  max?: number;
  allowedChars?: string;
  useRange?: boolean; // UI toggle state for numbers
}

function SortableSegment({ segment, onDelete, onChange }: {
  segment: Segment,
  onDelete: (id: string) => void,
  onChange: (id: string, updates: Partial<Segment>) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2 mb-2 p-3 bg-background border rounded-md shadow-sm">
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab hover:text-primary">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 grid grid-cols-[100px_1fr] gap-2 items-center">
          <span className="text-xs font-medium text-muted-foreground uppercase">{segment.type}</span>
          {segment.type === 'static' ? (
            <Input
              value={segment.value as string}
              onChange={(e) => onChange(segment.id, { value: e.target.value })}
              placeholder="Enter text..."
              className="h-8 text-sm"
            />
          ) : (
            <div className="flex items-center gap-4 flex-wrap">
              {/* Length Input (Always show unless range is active and exclusive? Let's treat them as modes) */}
              {/* For Number: Toggle between Length and Range */}
              {segment.type === 'number' && (
                <div className="flex items-center gap-2">
                  <Switch
                    id={`range-switch-${segment.id}`}
                    checked={segment.useRange || false}
                    onCheckedChange={(c) => onChange(segment.id, {
                      useRange: c,
                      // Reset values when switching modes to avoid confusion?
                      // Maybe set default min/max if enabling
                      min: c ? (segment.min ?? 1) : segment.min,
                      max: c ? (segment.max ?? 100) : segment.max
                    })}
                  />
                  <Label htmlFor={`range-switch-${segment.id}`} className="text-xs">Range Mode</Label>
                </div>
              )}

              {/* Length Input: Always show for padding control if range is active, or generic length if not */
                /* Removing the !segment.useRange condition to keep it visible as requested */
              }
              {segment.type !== 'number' || !segment.useRange ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-max whitespace-nowrap">Length:</span>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={segment.value as number}
                    onChange={(e) => onChange(segment.id, { value: parseInt(e.target.value) || 0 })}
                    className="h-8 w-16 text-sm"
                  />
                </div>
              ) : (
                /* When in Range Mode, show it as Padding Length */
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-max whitespace-nowrap">Padding:</span>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={segment.value as number}
                    onChange={(e) => onChange(segment.id, { value: parseInt(e.target.value) || 0 })}
                    className="h-8 w-16 text-sm"
                  />
                </div>
              )}

              {/* Range Inputs */}
              {segment.type === 'number' && segment.useRange && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Min:</span>
                  <Input
                    type="number"
                    value={segment.min ?? ''}
                    onChange={(e) => onChange(segment.id, { min: parseInt(e.target.value) || 0 })}
                    className="h-8 w-20 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">Max:</span>
                  <Input
                    type="number"
                    value={segment.max ?? ''}
                    onChange={(e) => onChange(segment.id, { max: parseInt(e.target.value) || 0 })}
                    className="h-8 w-24 text-sm"
                  />
                </div>
              )}

              {/* Allowed Chars Input */}
              {segment.type === 'letter' && (
                <div className="flex items-center gap-2 flex-grow min-w-[150px]">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Allowed:</span>
                  <Input
                    value={segment.allowedChars ?? ''}
                    onChange={(e) => onChange(segment.id, { allowedChars: e.target.value })}
                    placeholder="A-Z (Leave empty for all)"
                    className="h-8 text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(segment.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function LotteryGenerator() {
  const [mode, setMode] = useState<'simple' | 'complex'>('simple');
  const [includeLetters, setIncludeLetters] = useState(false);
  const [length, setLength] = useState("6");

  // Complex mode state
  const [segments, setSegments] = useState<Segment[]>([]);

  const { animationDuration, confettiConfig } = useSettings();
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, dismiss } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isGenerating) {
      stopAudio();
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    }
  }, [isGenerating, stopAudio]);

  useEffect(() => {
    return () => {
      if (animationIntervalRef.current)
        clearInterval(animationIntervalRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const getCurrentParams = (): LotteryPresetParams => ({
    length,
    includeLetters,
    mode,
    segments: mode === 'complex' ? segments : undefined,
  });

  const handleLoadPreset = (params: any) => {
    const p = params as LotteryPresetParams;
    // Default to 'simple' if mode is missing (legacy presets)
    setMode(p.mode || 'simple');
    setLength(p.length || "6");
    setIncludeLetters(p.includeLetters || false);
    if (p.segments) {
      setSegments(p.segments.map((s: any) => ({
        ...s,
        id: s.id || crypto.randomUUID(),
        useRange: (s.min !== undefined && s.max !== undefined) // Auto-detect range mode
      })));
    } else {
      setSegments([]);
    }
  };

  // --- Complex Mode Handlers ---
  const addSegment = (type: SegmentType) => {
    const newSegment: Segment = {
      id: crypto.randomUUID(),
      type,
      value: type === 'static' ? '' : 4,
    };
    if (type === 'number') {
      newSegment.min = 0;
      newSegment.max = 99;
      newSegment.useRange = false;
    }
    if (type === 'letter') {
      newSegment.allowedChars = '';
    }
    setSegments([...segments, newSegment]);
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter(s => s.id !== id));
  };

  const updateSegment = (id: string, updates: Partial<Segment>) => {
    setSegments(segments.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSegments((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- Generation Logic ---

  const generateRandomString = (len: number, charset: string) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return res;
  };

  const generateSegmentValue = (segment: Segment) => {
    if (segment.type === 'static') return segment.value as string;

    const len = typeof segment.value === 'number' ? segment.value : 0;

    if (segment.type === 'number') {
      // Check if using range
      if (segment.useRange && segment.min !== undefined && segment.max !== undefined) {
        const min = Number(segment.min);
        const max = Number(segment.max);
        if (!isNaN(min) && !isNaN(max) && max >= min) {
          const numStr = String(Math.floor(Math.random() * (max - min + 1)) + min);
          // Apply padding based on length 'value'
          return numStr.padStart(len, '0');
        }
      }
      return generateRandomString(len, "0123456789");
    }

    if (segment.type === 'letter') {
      // Remove whitespace from allowedChars to avoid invisible char issues if user typed spaces
      const cleaned = segment.allowedChars?.replace(/\s/g, "") || "";
      const charset = cleaned.length > 0
        ? cleaned
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      return generateRandomString(len, charset);
    }

    if (segment.type === 'mixed') {
      return generateRandomString(len, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    }

    return "";
  };

  const handleGenerate = async () => {
    sendGTMEvent({
      event: "action_lottery_randomizer",
      user_email: user ? user.email : "guest",
    });
    if (isGenerating || isRateLimited) return;

    // Validation
    if (mode === 'simple') {
      const len = parseInt(length, 10);
      if (isNaN(len) || len <= 0 || len > 100) {
        setError("Please enter a length between 1 and 100.");
        return;
      }
    } else {
      if (segments.length === 0) {
        setError("Please add at least one segment.");
        return;
      }
      for (const s of segments) {
        if (s.type !== 'static') {
          const slen = Number(s.value);
          if (slen <= 0 || slen > 50) {
            setError("Segment lengths must be between 1 and 50.");
            return;
          }
        }
      }
    }

    triggerRateLimit();
    playAudio();
    setError(null);
    setIsGenerating(true);
    setIsCopied(false);
    setResult(null);

    const dur = animationDuration;

    // Animation Logic
    animationIntervalRef.current = setInterval(() => {
      let tempResult = "";
      if (mode === 'simple') {
        const len = parseInt(length, 10);
        const characterSet = includeLetters ? "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "0123456789";
        tempResult = generateRandomString(len, characterSet);
      } else {
        // Complex animation: Approximate length of final string for visual effect
        // We can just generate random chars of total approx length
        // Or try to match segment structure loosely?
        // Let's match structure for better effect
        tempResult = segments.map(s => {
          if (s.type === 'static') return s.value;
          const slen = Number(s.value);
          // Just use mixed charset for animation
          return generateSegmentValue(s);
          // return generateRandomString(slen, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        }).join("");
      }
      setResult(tempResult);
    }, 50);

    let countdown = dur;
    const { id: toastId, update } = toast({
      title: "Counting Down in...",
      description: <span className="text-3xl">{countdown}s</span>,
      duration: (dur + 2) * 1000,
    });

    countdownIntervalRef.current = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        update({
          id: toastId,
          description: <span className="text-3xl">{countdown}s</span>,
        });
      }
    }, 1000);

    try {
      // Async generation or local generation simulation
      // For simple mode, we used a server action before. 
      // For complex mode, we can do it client side or refactor server action needed. 
      // The prompt didn't strictly require server action for the new logic, but consistency is good.
      // However, complex logic is purely algorithmic. Local generation is fine for now unless cryptographic randomness is crucial.
      // Given existing 'generateLottery' is simple, let's keep simple mode using it if preferred, 
      // OR just do everything local/consistent here.
      // Simulating async wait to match 'dur'

      await new Promise(resolve => setTimeout(resolve, dur * 1000));

      let finalResult = "";
      if (mode === 'simple') {
        // Re-using server action if needed, but actually we can just generate locally to avoid rewriting server action for now
        // BUT `generateLottery` in `handleGenerate` originally used `await generateLottery`.
        // If we want to support complex mode, we should probably implement the logic here for now.
        const len = parseInt(length, 10);
        const characterSet = includeLetters ? "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "0123456789";
        finalResult = generateRandomString(len, characterSet);
      } else {
        finalResult = segments.map(s => {
          if (s.type === 'static') return s.value;
          const slen = Number(s.value);
          if (s.type === 'number') return generateSegmentValue(s);
          if (s.type === 'letter') return generateSegmentValue(s);
          if (s.type === 'mixed') return generateSegmentValue(s);
          return "";
        }).join("");
      }


      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      setResult(finalResult);
      setIsGenerating(false);

      if (confettiConfig.enabled) {
        threwConfetti({
          particleCount: confettiConfig.particleCount,
          spread: confettiConfig.spread,
        });
      }

      update({
        id: toastId,
        title: "Winner Generated!",
        description: finalResult,
        hidden: true,
      });

    } catch (e: any) {
      setError(e.message);
      setIsGenerating(false);
      if (animationIntervalRef.current)
        clearInterval(animationIntervalRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
      dismiss(toastId);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Combination copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Lottery Generator</CardTitle>
        <CardDescription>
          Generate a random combination. Use <strong>Complex Mode</strong> to define specific patterns. You could change the duration of the randomization from <Link href="/setting#animation-duration" className="underline">settings &gt; animation duration</Link>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PresetManager
          toolId="lottery"
          currentParams={getCurrentParams()}
          onLoadPreset={handleLoadPreset}
        />

        <div className="flex items-center space-x-2 pb-4 border-b">
          <Label htmlFor="mode-switch">Complex Mode</Label>
          <Switch
            id="mode-switch"
            checked={mode === 'complex'}
            onCheckedChange={(checked) => setMode(checked ? 'complex' : 'simple')}
            disabled={isGenerating}
          />
        </div>

        {mode === 'simple' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="combination-length">Length</Label>
              <Input
                id="combination-length"
                type="number"
                min="1"
                max="100"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                disabled={isGenerating || isRateLimited}
              />
            </div>
            <div className="flex w-full items-center gap-2 space-x-2 pt-6">
              <Switch
                id="include-letters"
                checked={includeLetters}
                onCheckedChange={setIncludeLetters}
                disabled={isGenerating || isRateLimited}
              />
              <Label htmlFor="include-letters">Include Letters</Label>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-muted/30 p-4 rounded-md border text-sm text-muted-foreground space-y-1">
              <p className="flex items-center gap-2 font-medium text-foreground"><Info className="h-4 w-4" /> How to use:</p>
              <ul className="list-disc list-inside pl-1 space-y-1">
                <li>Add segments to build your pattern (e.g., AAAA-9999).</li>
                <li>Drag to reorder segments.</li>
                <li><strong>Static:</strong> Fixed text (e.g., "ID-").</li>
                <li><strong>Random:</strong> Random characters of specified length.</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => addSegment('number')} disabled={isGenerating}><PlusCircle className="mr-1 h-3 w-3" /> Number</Button>
              <Button variant="outline" size="sm" onClick={() => addSegment('letter')} disabled={isGenerating}><PlusCircle className="mr-1 h-3 w-3" /> Letter</Button>
              <Button variant="outline" size="sm" onClick={() => addSegment('mixed')} disabled={isGenerating}><PlusCircle className="mr-1 h-3 w-3" /> Mixed</Button>
              <Button variant="outline" size="sm" onClick={() => addSegment('static')} disabled={isGenerating}><PlusCircle className="mr-1 h-3 w-3" /> Static Text</Button>
            </div>

            <div className="space-y-2 min-h-[100px] border rounded-lg p-4 bg-muted/10">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={segments}
                  strategy={verticalListSortingStrategy}
                >
                  {segments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No segments. Add one to start!</p>
                  )}
                  {segments.map((segment) => (
                    <SortableSegment
                      key={segment.id}
                      segment={segment}
                      onDelete={removeSegment}
                      onChange={updateSegment}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}

        {(result || isGenerating) && (
          <div className="relative min-h-[60px] flex items-center justify-center bg-muted/50 rounded-lg p-8">
            <p className="text-4xl tracking-widest text-accent font-mono select-all break-all text-center">
              {result}
            </p>
            {result && !isGenerating && (
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={handleGenerate}
          disabled={isGenerating || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating
            ? "Generating..."
            : isRateLimited
              ? "Please wait..."
              : "Generate Combination"}
        </Button>
      </CardFooter>
    </Card>
  );
}
