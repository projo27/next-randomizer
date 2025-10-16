"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "./ui/alert";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { randomizeDates } from "@/app/actions/date-randomizer-action";
import { useSettings } from "@/context/SettingsContext";
import { useRandomizerAudio } from "@/context/RandomizerAudioContext";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";

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
          <CardTitle>Shuffling Date(s)...</CardTitle>
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

export default function DateRandomizer() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [numberOfDates, setNumberOfDates] = useState("3");
  const [includeTime, setIncludeTime] = useState(false);
  const [is24Hour, setIs24Hour] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [dateFormat, setDateFormat] = useState("PPP");

  const [results, setResults] = useState<Date[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResultCopied, setIsResultCopied] = useState(false);
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

  useEffect(() => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setStartDate(now);
    setEndDate(nextMonth);
  }, []);

  const handleRandomize = async () => {
    sendGTMEvent({
      event: "action_date_randomizer",
      user_email: user ? user.email : "guest",
    });
    if (isRandomizing || isRateLimited) return;
    triggerRateLimit();
    playAudio();
    setError(null);
    setResults([]);
    setIsResultCopied(false);

    if (!startDate || !endDate) {
      setError("Please select both a start and an end date.");
      return;
    }

    const count = parseInt(numberOfDates, 10);
    if (isNaN(count) || count <= 0) {
      setError(
        "Please enter a valid number of dates to generate (must be > 0).",
      );
      return;
    }

    if (startDate > endDate) {
      setStartDate(endDate);
      setEndDate(startDate);
    }

    const dayDifference =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
    if (count > 1000 || (count > dayDifference && !includeTime)) {
      setError(
        `Cannot generate more than ${Math.min(
          1000,
          Math.floor(dayDifference),
        )} unique dates in this range without time.`,
      );
      return;
    }

    if (includeTime && startTime >= endTime) {
      setError("Start time must be before end time.");
      return;
    }

    setIsRandomizing(true);

    try {
      const serverResult = await randomizeDates(
        startDate,
        endDate,
        count,
        includeTime,
        startTime,
        endTime,
      );
      setTimeout(() => {
        setResults(serverResult.map((d) => new Date(d))); // Re-hydrate date objects
        setIsRandomizing(false);
      }, animationDuration * 1000);
    } catch (e: any) {
      setError(e.message);
      setIsRandomizing(false);
    }
  };

  const getFormatString = () => {
    if (includeTime) {
      const timeFormat = is24Hour ? "HH:mm" : "p";
      return `${dateFormat} · ${timeFormat}`;
    }
    return dateFormat;
  };

  const handleCopyResult = () => {
    if (results.length === 0) return;
    const formatString = getFormatString();
    const resultString = results
      .map((date) => format(date, formatString))
      .join("\n");
    navigator.clipboard.writeText(resultString);
    setIsResultCopied(true);
    toast({
      title: "Copied!",
      description: "Random dates copied to clipboard.",
    });
    setTimeout(() => setIsResultCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Date Randomizer</CardTitle>
        <CardDescription>
          Pick a number of random dates between two dates, with an optional time
          range.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            date={startDate}
            setDate={setStartDate}
          />
          <DatePicker label="End Date" date={endDate} setDate={setEndDate} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="date-format">Date Format</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger id="date-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PPP">Short (Jan 1, 2024)</SelectItem>
                <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                <SelectItem value="MMMM d, yyyy">
                  Long (January 1, 2024)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="num-dates">Number of Dates to Generate</Label>
            <Input
              id="num-dates"
              type="number"
              min="1"
              max="1000"
              value={numberOfDates}
              onChange={(e) => setNumberOfDates(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="include-time"
            checked={includeTime}
            onCheckedChange={setIncludeTime}
          />
          <Label htmlFor="include-time">Include Time</Label>
        </div>

        {includeTime && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="time-format"
                checked={is24Hour}
                onCheckedChange={setIs24Hour}
              />
              <Label htmlFor="time-format">Use 24-Hour Format</Label>
            </div>
          </>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {(isRandomizing || results.length > 0) && (
          <AnimatedResultList
            isShuffling={isRandomizing}
            shuffledItems={results.map((r) => format(r, getFormatString()))}
            isResultCopied={isResultCopied}
            handleCopyResult={handleCopyResult}
            title="Random Dates"
            itemClassName="text-lg font-mono"
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          disabled={isRandomizing || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing
            ? "Randomizing..."
            : isRateLimited
              ? "Please wait..."
              : "Randomize Dates!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
