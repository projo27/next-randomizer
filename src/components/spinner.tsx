
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
import { Wand2, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { getSpinnerWinner } from "@/app/actions/spinner-action";

const WHEEL_COLORS = [
  "#FFC107", "#FF9800", "#FF5722", "#F44336",
  "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
  "#2196F3", "#03A9F4", "#00BCD4", "#009688",
  "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B",
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

// @ts-ignore
const CustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index, payload }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textColor = getBestTextColor(WHEEL_COLORS[index % WHEEL_COLORS.length]);

  return (
    <text
      x={x}
      y={y}
      fill={textColor}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {payload.name}
    </text>
  );
};


export default function Spinner() {
  const [itemsText, setItemsText] = useState("Apple\nBanana\nOrange\nGrape");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(5500);

  const items = useMemo(() => itemsText.split("\n").map(i => i.trim()).filter(i => i), [itemsText]);
  
  const data = useMemo(() => {
    if (items.length === 0) return [{ name: 'Empty', value: 1 }];
    return items.map(item => ({ name: item, value: 1 }));
  }, [items]);
  
  const segmentAngle = 360 / (items.length || 1);

  const handleSpin = async () => {
    if (items.length < 2) {
      toast({
        title: "Not enough items",
        description: "Please enter at least 2 items to spin the wheel.",
        variant: "destructive"
      });
      return;
    }
    if (isSpinning) return;
    triggerRateLimit();
    setIsSpinning(true);
    setWinner(null);
    setIsResultCopied(false);

    // The server determines the winner
    const newWinner = await getSpinnerWinner(items);
    if (!newWinner) {
      setIsSpinning(false);
      return;
    }

    const winnerIndex = items.indexOf(newWinner);

    // Calculate rotation to land on the winner
    // The arrow points down (270deg on the chart). The chart starts at 0deg (3 o'clock).
    const targetAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
    const offsetAngle = (270 - 90); // Adjust for arrow position and chart start
    const randomAngleInSegment = (Math.random() - 0.5) * segmentAngle * 0.8;
    const finalTargetAngle = (targetAngle + randomAngleInSegment) % 360;

    const spinCycles = 5 + Math.floor(Math.random() * 5);
    const newRotation = rotation + (360 * spinCycles) + (360 - (rotation % 360)) - finalTargetAngle + offsetAngle;
    
    setRotation(newRotation);

    setTimeout(() => {
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

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Spinner Wheel</CardTitle>
        <CardDescription>Enter items to spin the wheel and pick a random winner.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative">
          <div className="aspect-square p-4 relative flex items-center justify-center">
              <div 
                className="spinner-arrow absolute w-10 h-10 text-accent -top-1" 
                style={{ transform: "translateX(-50%) rotate(0deg)", clipPath: "polygon(50% 100%, 0 0, 100% 0)"}}
              />
              <div 
                className="w-full h-full rounded-full border-4 border-accent shadow-2xl overflow-hidden relative transition-transform duration-[5000ms] ease-out"
                style={{
                    transform: `rotate(${rotation}deg)`
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            // @ts-ignore
                            label={<CustomizedLabel />}
                            outerRadius="100%"
                            innerRadius="10%"
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                        >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={WHEEL_COLORS[index % WHEEL_COLORS.length]} stroke={WHEEL_COLORS[index % WHEEL_COLORS.length]}/>
                        ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
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
                disabled={isSpinning || isRateLimited}
              />
              <div className="absolute top-8 right-2 flex flex-col gap-2">
                <Button variant="ghost" size="icon" onClick={handleCopyInput} disabled={isSpinning || isRateLimited}>
                  {isInputCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClearInput} disabled={isSpinning || isRateLimited}>
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
          disabled={isSpinning || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isSpinning ? "Spinning..." : isRateLimited ? "Please wait..." : "Spin the Wheel!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
