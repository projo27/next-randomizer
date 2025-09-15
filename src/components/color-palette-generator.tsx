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
import { cn } from "@/lib/utils";

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function getBestTextColor(bgColor: string): string {
  const color = bgColor.substring(1);
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128 ? "white" : "black";
}

export default function ColorPaletteGenerator() {
  const [count, setCount] = useState("5");
  const [palette, setPalette] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePalette = () => {
    setIsGenerating(true);
    setCopiedColor(null);
    const numColors = parseInt(count, 10);
    const newPalette: string[] = [];

    const baseHue = Math.random() * 360;
    const saturation = 50 + Math.random() * 30; // 50% to 80%
    const lightness = 60 + Math.random() * 15; // 60% to 75%

    // Using analogous color scheme
    const hueStep = 30;

    for (let i = 0; i < numColors; i++) {
      const hue = (baseHue + i * hueStep) % 360;
      const l = lightness - i * 5; // Slightly decrease lightness for variation
      newPalette.push(hslToHex(hue, saturation, l));
    }
    
    setTimeout(() => {
        setPalette(newPalette);
        setIsGenerating(false);
    }, 500);
  };
  
  useEffect(() => {
    generatePalette();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    toast({
      title: "Copied!",
      description: `${color} copied to clipboard.`,
    });
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Color Palette Generator</CardTitle>
        <CardDescription>
          Create beautiful and harmonious color palettes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="color-count">Number of Colors</Label>
          <Select
            value={count}
            onValueChange={setCount}
            disabled={isGenerating}
          >
            <SelectTrigger id="color-count" className="w-24">
              <SelectValue placeholder="5" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row rounded-lg overflow-hidden min-h-[200px] shadow-inner">
          {palette.map((color, index) => (
            <div
              key={index}
              className={cn(
                  "flex-1 p-4 flex flex-col justify-end items-center text-center transition-all duration-500",
                  isGenerating && "opacity-50"
              )}
              style={{ backgroundColor: color, color: getBestTextColor(color) }}
            >
              <div className="bg-black/20 rounded-md p-2 flex items-center gap-2">
                <span className="font-mono text-lg">{color}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/30"
                  onClick={() => handleCopy(color)}
                >
                  {copiedColor === color ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={generatePalette}
          disabled={isGenerating}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate New Palette"}
        </Button>
      </CardFooter>
    </Card>
  );
}
