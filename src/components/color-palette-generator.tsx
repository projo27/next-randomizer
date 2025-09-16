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
import { useRateLimiter } from "@/hooks/use-rate-limiter";

type ColorScheme = "analogous" | "monochromatic" | "complementary" | "split-complementary" | "triadic" | "tetradic" | "square";

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
  const [numColors, setNumColors] = useState("5");
  const [numPalettes, setNumPalettes] = useState("1");
  const [scheme, setScheme] = useState<ColorScheme>("analogous");
  const [palettes, setPalettes] = useState<string[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const generatePalettes = () => {
    if(isGenerating) return;
    triggerRateLimit();
    setIsGenerating(true);
    setCopiedColor(null);

    const countPalettes = parseInt(numPalettes, 10);
    const allNewPalettes: string[][] = [];

    for (let p = 0; p < countPalettes; p++) {
      const count = parseInt(numColors, 10);
      let newPalette: string[] = [];

      const baseHue = Math.random() * 360;
      const saturation = 50 + Math.random() * 30; // 50% to 80%
      const lightness = 65 + Math.random() * 10; // 65% to 75%

      const hues: number[] = [baseHue];

      switch (scheme) {
        case "monochromatic":
          for (let i = 0; i < count; i++) {
            const l = lightness - 15 + (i / (count - 1)) * 30;
            const s = saturation - 10 + (i / (count - 1)) * 20;
            newPalette.push(hslToHex(baseHue, Math.min(100, Math.max(20, s)), Math.min(95, Math.max(15, l))));
          }
          break;
        case "complementary":
          hues.push((baseHue + 180) % 360);
          break;
        case "split-complementary":
          hues.push((baseHue + 150) % 360);
          hues.push((baseHue + 210) % 360);
          break;
        case "triadic":
          hues.push((baseHue + 120) % 360);
          hues.push((baseHue + 240) % 360);
          break;
        case "tetradic":
          hues.push((baseHue + 60) % 360);
          hues.push((baseHue + 180) % 360);
          hues.push((baseHue + 240) % 360);
          break;
        case "square":
          hues.push((baseHue + 90) % 360);
          hues.push((baseHue + 180) % 360);
          hues.push((baseHue + 270) % 360);
          break;
        case "analogous":
        default:
          for (let i = 1; i < count; i++) {
            hues.push((baseHue + i * 30) % 360);
          }
          break;
      }

      if (scheme !== 'monochromatic') {
        for (let i = 0; i < count; i++) {
          const hue = hues[i % hues.length];
          const l = lightness - (i * 3) + Math.random() * 6;
          const s = saturation - (i * 2) + Math.random() * 4;
          newPalette.push(hslToHex(hue, Math.min(100, Math.max(40, s)), Math.min(95, Math.max(20, l))));
        }
      }
      allNewPalettes.push(newPalette);
    }


    setTimeout(() => {
      setPalettes(allNewPalettes);
      setIsGenerating(false);
    }, 500);
  };

  useEffect(() => {
    generatePalettes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    toast({
      title: "Copied!",
      description: `${color} copied to clipboard.`,
      duration: 1600
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="color-count">Number of Colors</Label>
            <Select
              value={numColors}
              onValueChange={setNumColors}
              disabled={isGenerating || isRateLimited}
            >
              <SelectTrigger id="color-count" className="w-24">
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="num-palettes">Number of Palettes Generated</Label>
            <Select
              value={numPalettes}
              onValueChange={setNumPalettes}
              disabled={isGenerating || isRateLimited}
            >
              <SelectTrigger id="num-palettes" className="w-24">
                <SelectValue placeholder="1" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(7)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="color-scheme">Scheme</Label>
            <Select
              value={scheme}
              onValueChange={(v) => setScheme(v as ColorScheme)}
              disabled={isGenerating || isRateLimited}
            >
              <SelectTrigger id="color-scheme" className="w-full">
                <SelectValue placeholder="Scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="analogous">Analogous</SelectItem>
                <SelectItem value="monochromatic">Monochromatic</SelectItem>
                <SelectItem value="complementary">Complementary</SelectItem>
                <SelectItem value="split-complementary">Split-Complementary</SelectItem>
                <SelectItem value="triadic">Triadic</SelectItem>
                <SelectItem value="tetradic">Tetradic</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {palettes.map((palette, pIndex) => (
            <div key={pIndex} className="flex flex-col md:flex-row rounded-lg overflow-hidden min-h-[100px] shadow-inner">
              {palette.map((color, cIndex) => (
                <div
                  key={cIndex}
                  className={cn(
                    "flex-1 flex flex-col justify-end items-strech text-center transition-all duration-500 w-full min-h-32",
                    isGenerating && "opacity-50"
                  )}
                  style={{ backgroundColor: color, color: getBestTextColor(color) }}
                >
                  {/* <div className=""> */}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-none hover:bg-white/30 p-2 flex flex-row items-center justify-center w-full h-1/3"
                    onClick={() => handleCopy(color)}
                  >
                    <span className="font-mono text-sm md:text-base">{color}</span>
                    {copiedColor === color ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                  {/* </div> */}
                </div>
              ))}
            </div>
          ))}
        </div>

      </CardContent>
      <CardFooter>
        <Button
          onClick={generatePalettes}
          disabled={isGenerating || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : isRateLimited ? "Please wait..." : "Generate New Palette(s)"}
        </Button>
      </CardFooter>
    </Card>
  );
}
