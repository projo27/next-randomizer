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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Wand2, Copy, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { useSettings } from "@/context/SettingsContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";
import { randomizeSeatingChart } from "@/app/actions/seating-chart-action";
import { Skeleton } from "./ui/skeleton";

export default function SeatingChartRandomizer() {
  const [rows, setRows] = useState("4");
  const [cols, setCols] = useState("5");
  const [participantsText, setParticipantsText] = useState(
    "Alice\nBob\nCharlie\nDavid\nEve\nFrank\nGrace\nHeidi\nIvan\nJudy",
  );
  const [seatingChart, setSeatingChart] = useState<string[][] | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();

  useEffect(() => {
    if (!isRandomizing) {
      stopAudio();
    }
  }, [isRandomizing, stopAudio]);

  const handleRandomize = async () => {
    sendGTMEvent({
      event: "action_seating_chart_randomizer",
      user_email: user ? user.email : "guest",
    });
    if (isRandomizing || isRateLimited) return;
    triggerRateLimit();
    playAudio();
    setError(null);
    setSeatingChart(null);
    setIsCopied(false);

    const numRows = parseInt(rows, 10);
    const numCols = parseInt(cols, 10);
    const participants = participantsText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    if (isNaN(numRows) || isNaN(numCols) || numRows <= 0 || numCols <= 0) {
      setError("Please enter valid numbers for rows and columns.");
      return;
    }

    if (participants.length === 0) {
      setError("Please enter at least one participant.");
      return;
    }

    setIsRandomizing(true);
    try {
      const result = await randomizeSeatingChart(numRows, numCols, participants);
      setTimeout(() => {
        setSeatingChart(result);
        setIsRandomizing(false);
      }, animationDuration * 1000);
    } catch (e: any) {
      setError(e.message);
      setIsRandomizing(false);
    }
  };
  
  const handleCopyResult = () => {
    if (!seatingChart) return;
    const resultString = seatingChart
      .map((row, rIndex) => 
        `Row ${rIndex + 1}: ` + row.map((seat, cIndex) => `Seat ${cIndex + 1}: ${seat}`).join(', ')
      )
      .join('\n');
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Seating chart copied to clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const numParticipants = participantsText.split("\n").filter(Boolean).length;
  const numSeats = parseInt(rows, 10) * parseInt(cols, 10);

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Seating Chart Randomizer</CardTitle>
        <CardDescription>
          Randomly assign participants to seats in a grid layout.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="columns">Columns</Label>
              <Input
                id="columns"
                type="number"
                min="1"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
                disabled={isRandomizing}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                disabled={isRandomizing}
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Total Seats: {isNaN(numSeats) ? 0 : numSeats}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="participants">Participants ({numParticipants})</Label>
            <Textarea
              id="participants"
              placeholder="Enter one name per line"
              rows={10}
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              disabled={isRandomizing}
            />
          </div>
        </div>

        <div className="space-y-4">
            <Label>Seating Chart Result</Label>
             {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="relative p-4 border rounded-lg min-h-[300px] bg-muted/50">
                {seatingChart && !isRandomizing && (
                    <div className="absolute top-2 right-2">
                        <Button variant="ghost" size="icon" onClick={handleCopyResult}>
                        {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                    </div>
                )}
                {isRandomizing ? (
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                        {Array.from({ length: Math.min(numSeats, 20) }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : seatingChart ? (
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                        {seatingChart.flat().map((seat, index) => (
                            <div key={index} className={`flex items-center justify-center h-12 p-1 rounded-md text-xs text-center font-semibold ${seat === 'Empty' ? 'bg-background/50 text-muted-foreground italic' : 'bg-primary/20 text-primary-foreground'}`}>
                                {seat}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Your seating chart will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isRandomizing || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing ? "Assigning Seats..." : "Randomize Seats"}
        </Button>
      </CardFooter>
    </Card>
  );
}
