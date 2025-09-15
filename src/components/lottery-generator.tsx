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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NUMBERS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function LotteryGenerator() {
  const [includeLetters, setIncludeLetters] = useState(false);
  const [length, setLength] = useState("6");
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsCopied(false);
    setResult(null);

    const len = parseInt(length, 10);
    if (isNaN(len) || len <= 0 || len > 100) {
      toast({
        title: "Invalid Length",
        description: "Please enter a length between 1 and 100.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    let characterSet = NUMBERS;
    if (includeLetters) {
      characterSet += LETTERS;
    }

    let generated = "";
    for (let i = 0; i < len; i++) {
      generated += characterSet.charAt(
        Math.floor(Math.random() * characterSet.length)
      );
    }
    
    // Animate the result
    let tempResult = "";
    const interval = setInterval(() => {
        tempResult = "";
        for (let i = 0; i < len; i++) {
            tempResult += characterSet.charAt(
                Math.floor(Math.random() * characterSet.length)
            );
        }
        setResult(tempResult);
    }, 50);


    setTimeout(() => {
        clearInterval(interval);
        setResult(generated);
        setIsGenerating(false);
    }, 1000);
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
        <CardTitle>Combination Generator</CardTitle>
        <CardDescription>
          Generate a random combination of numbers and/or letters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="include-letters"
              checked={includeLetters}
              onCheckedChange={setIncludeLetters}
              disabled={isGenerating}
            />
            <Label htmlFor="include-letters">Include Letters</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="combination-length">Length</Label>
            <Input
              id="combination-length"
              type="number"
              min="1"
              max="100"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-20"
              disabled={isGenerating}
            />
          </div>
        </div>
        
        {(result || isGenerating) && (
            <div className="relative min-h-[60px] flex items-center justify-center bg-muted/50 rounded-lg p-4">
                <p className="text-3xl font-mono tracking-widest text-accent">
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

      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Combination"}
        </Button>
      </CardFooter>
    </Card>
  );
}
