
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wand2, Download, RectangleHorizontal, RectangleVertical, Square, Layers, Circle, Triangle, Waves
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useSettings } from '@/context/SettingsContext';
import { useRandomizerAudio } from '@/context/RandomizerAudioContext';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Slider } from './ui/slider';

type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
type PatternType = 'circles' | 'squares' | 'triangles' | 'lines' | 'waves';

const ASPECT_RATIOS: { value: AspectRatio, icon: React.ReactNode, label: string }[] = [
  { value: '16:9', icon: <RectangleHorizontal />, label: 'Desktop' },
  { value: '9:16', icon: <RectangleVertical />, label: 'Phone' },
  { value: '1:1', icon: <Square />, label: 'Square' },
  { value: '4:3', icon: <RectangleHorizontal className="transform scale-x-75" />, label: 'Standard' },
];

const PATTERN_TYPES: { value: PatternType, icon: React.ReactNode, label: string }[] = [
  { value: 'circles', icon: <Circle />, label: 'Circles' },
  { value: 'squares', icon: <Square />, label: 'Squares' },
  { value: 'triangles', icon: <Triangle />, label: 'Triangles' },
  { value: 'lines', icon: <Layers />, label: 'Lines' },
  { value: 'waves', icon: <Waves />, label: 'Waves' },
];

function generateRandomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30) + 70; // 70-100% saturation
  const l = Math.floor(Math.random() * 40) + 30; // 30-70% lightness
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function drawSeamlessElement(element: React.ReactNode, x: number, y: number, width: number, height: number, size: number) {
  const elements = [element];
  const halfSize = size / 2;

  // Check edges and wrap around
  if (x - halfSize < 0) { // Left edge
    elements.push(React.cloneElement(element as React.ReactElement, { key: `${(element as any).key}-l`, transform: `translate(${width}, 0)` }));
  }
  if (x + halfSize > width) { // Right edge
    elements.push(React.cloneElement(element as React.ReactElement, { key: `${(element as any).key}-r`, transform: `translate(${-width}, 0)` }));
  }
  if (y - halfSize < 0) { // Top edge
    elements.push(React.cloneElement(element as React.ReactElement, { key: `${(element as any).key}-t`, transform: `translate(0, ${height})` }));
  }
  if (y + halfSize > height) { // Bottom edge
    elements.push(React.cloneElement(element as React.ReactElement, { key: `${(element as any).key}-b`, transform: `translate(0, ${-height})` }));
  }

  // Check corners
  if (x - halfSize < 0 && y - halfSize < 0) { // Top-left
    elements.push(React.cloneElement(element as React.ReactElement, { key: `${(element as any).key}-tl`, transform: `translate(${width}, ${height})` }));
  }
  if (x + halfSize > width && y - halfSize < 0) { // Top-right
    elements.push(React.cloneElement(element as React.ReactElement, { key: `${(element as any).key}-tr`, transform: `translate(${-width}, ${height})` }));
  }
  if (x - halfSize < 0 && y + halfSize > height) { // Bottom-left
    elements.push(React.cloneElement(element as React.ReactElement, { key: `${(element as any).key}-bl`, transform: `translate(${width}, ${-height})` }));
  }
  if (x + halfSize > width && y + halfSize > height) { // Bottom-right
    elements.push(React.cloneElement(element as React.ReactElement, { key: `${(element as any).key}-br`, transform: `translate(${-width}, ${-height})` }));
  }

  return <g>{elements}</g>;
}


function generatePattern(width: number, height: number, density: number, type: PatternType) {
  const elements = [];
  const numElements = Math.floor((width * height) / (15000 / density));
  const colors = Array.from({ length: 4 }, generateRandomColor);
  const baseRotation = Math.random() * 360;

  if (type === 'waves') {
    for (let i = 0; i < numElements / 2; i++) {
        const x1 = -width * 0.1;
        const y1 = Math.random() * height;
        const x2 = width * 1.1;
        const y2 = Math.random() * height;
        const cx1 = Math.random() * width;
        const cy1 = Math.random() * height;
        const cx2 = Math.random() * width;
        const cy2 = Math.random() * height;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const opacity = Math.random() * 0.5 + 0.3;
        elements.push(
            <path key={i} d={`M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`} stroke={color} strokeWidth={Math.random() * 15 + 5} fill="none" opacity={opacity} />
        );
    }
  } else {
    for (let i = 0; i < numElements; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * (width / 10) + (width / 25);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = Math.random() * 0.6 + 0.2;
      const rotation = baseRotation + (Math.random() - 0.5) * 60;

      let element;

      switch (type) {
        case 'circles':
          element = <circle key={i} cx={x} cy={y} r={size / 2} fill={color} opacity={opacity} />;
          break;
        case 'squares':
          element = <rect key={i} x={x - size / 2} y={y - size / 2} width={size} height={size} fill={color} opacity={opacity} transform={`rotate(${rotation} ${x} ${y})`} />;
          break;
        case 'triangles':
          const halfSize = size / 2;
          element = <polygon key={i} points={`${x},${y - halfSize} ${x - halfSize},${y + halfSize} ${x + halfSize},${y + halfSize}`} fill={color} opacity={opacity} transform={`rotate(${rotation} ${x} ${y})`} />;
          break;
        case 'lines':
          const angle = Math.random() * 360;
          const x2 = x + Math.cos(angle * Math.PI / 180) * size * 2;
          const y2 = y + Math.sin(angle * Math.PI / 180) * size * 2;
          element = <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke={color} strokeWidth={Math.random() * 8 + 2} opacity={opacity} />;
          break;
      }
      elements.push(drawSeamlessElement(element, x, y, width, height, size));
    }
  }

  const bgColor = `hsl(${Math.floor(Math.random() * 360)}, 20%, 95%)`;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ backgroundColor: bgColor }}>
      {elements}
    </svg>
  );
}

export default function PatternRandomizer() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [patternType, setPatternType] = useState<PatternType>('circles');
  const [density, setDensity] = useState(5);
  const [patternSvg, setPatternSvg] = useState<React.ReactNode>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(2000);
  const { playAudio } = useRandomizerAudio();
  const { user } = useAuth();

  const handleGenerate = useCallback(() => {
    sendGTMEvent({ event: 'action_pattern_randomizer', user_email: user?.email ?? 'guest' });
    if (isGenerating || isRateLimited) return;
    triggerRateLimit();
    playAudio();
    setIsGenerating(true);

    const [w, h] = aspectRatio.split(':').map(Number);
    const generatedPattern = generatePattern(w * 100, h * 100, density, patternType);
    setPatternSvg(generatedPattern);

    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  }, [aspectRatio, density, patternType, isGenerating, isRateLimited, playAudio, user]);

  useEffect(() => {
    handleGenerate();
  }, [aspectRatio, patternType, density]); // Removed handleGenerate from deps to avoid loop with useCallback

  const handleDownload = (format: 'png' | 'webp') => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const [w, h] = aspectRatio.split(':').map(Number);
    const scale = 2; // for higher resolution
    canvas.width = w * 100 * scale;
    canvas.height = h * 100 * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `pattern-${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
      toast({ title: 'Success', description: `Pattern downloaded as ${format.toUpperCase()}.` });
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>SVG Pattern Randomizer</CardTitle>
        <CardDescription>
          Generate beautiful, seamless SVG patterns and download them as PNG or WEBP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Aspect Ratio</Label>
            <ToggleGroup
              type="single"
              value={aspectRatio}
              onValueChange={(value: AspectRatio) => value && setAspectRatio(value)}
              className="justify-start mt-2"
            >
              {ASPECT_RATIOS.map(ratio => (
                <ToggleGroupItem key={ratio.value} value={ratio.value} aria-label={ratio.label} className="flex flex-col h-16 w-16 gap-1">
                  {ratio.icon}
                  <span className="text-xs">{ratio.value}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div>
            <Label>Pattern Shape</Label>
            <ToggleGroup
              type="single"
              value={patternType}
              onValueChange={(value: PatternType) => value && setPatternType(value)}
              className="justify-start mt-2"
            >
              {PATTERN_TYPES.map(type => (
                <ToggleGroupItem key={type.value} value={type.value} aria-label={type.label} className="flex flex-col h-16 w-16 gap-1">
                  {type.icon}
                  <span className="text-xs">{type.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div>
          <Label>Density ({density})</Label>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[density]}
            onValueChange={(value) => setDensity(value[0])}
            className="mt-2"
          />
        </div>

        <div className="relative" style={{ aspectRatio }}>
          <div ref={svgRef} className={cn("w-full h-full bg-muted rounded-lg overflow-hidden transition-opacity duration-300", isGenerating ? "opacity-50" : "opacity-100")}>
            {patternSvg}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleDownload('png')} disabled={!patternSvg}>
            <Download className="mr-2 h-4 w-4" /> Download PNG
          </Button>
          <Button onClick={() => handleDownload('webp')} disabled={!patternSvg}>
            <Download className="mr-2 h-4 w-4" /> Download WEBP
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={handleGenerate}
          disabled={isGenerating || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Regenerate Pattern'}
        </Button>
      </CardFooter>
    </Card>
  );
}
