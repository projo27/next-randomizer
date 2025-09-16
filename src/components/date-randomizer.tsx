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
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import AnimatedResultList from "./animated-result-list";
import { useRateLimiter } from "@/hooks/use-rate-limiter";

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

  useEffect(() => {
    // Initialize dates on the client to avoid hydration mismatch
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setStartDate(now);
    setEndDate(nextMonth);
  }, []);

  const handleRandomize = () => {
    triggerRateLimit();
    setError(null);
    setResults([]);
    setIsResultCopied(false);
    setIsRandomizing(true);

    if (!startDate || !endDate) {
      setError("Please select both a start and an end date.");
      setIsRandomizing(false);
      return;
    }

    const count = parseInt(numberOfDates, 10);
    if (isNaN(count) || count <= 0) {
      setError("Please enter a valid number of dates to generate (must be > 0).");
      setIsRandomizing(false);
      return;
    }

    if (startDate > endDate) {
      let dateDiff = startDate.getTime() - endDate.getTime();
      setStartDate(endDate);
      setEndDate(startDate);
    }

    const dayDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
    if (count > 1000 || (count > dayDifference && !includeTime)) {
      setError(`Cannot generate more than ${Math.min(1000, Math.floor(dayDifference))} unique dates in this range without time.`);
      setIsRandomizing(false);
      return;
    }
    if (count > 1000) {
      setError(`Cannot generate more than 1000 unique dates.`);
      setIsRandomizing(false);
      return;
    }

    const tempStartDate = new Date(startDate);
    const tempEndDate = new Date(endDate);

    if (includeTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      tempStartDate.setHours(startHours, startMinutes, 0, 0);
      tempEndDate.setHours(endHours, endMinutes, 0, 0);

      if (tempStartDate.getTime() >= tempEndDate.getTime()) {
        setError("Start time must be before end time.");
        setIsRandomizing(false);
        return;
      }
    } else {
      tempStartDate.setHours(0, 0, 0, 0);
      tempEndDate.setHours(23, 59, 59, 999);
    }

    const startMs = tempStartDate.getTime();
    const endMs = tempEndDate.getTime();
    const generatedDates: Date[] = [];
    const generatedTimestamps = new Set();

    // Safety break to prevent infinite loops
    let maxTries = count * 100;

    while (generatedDates.length < count && maxTries > 0) {
      const randomMs = startMs + Math.random() * (endMs - startMs);
      const randomDate = new Date(randomMs);

      if (!includeTime) {
        randomDate.setHours(0, 0, 0, 0); // Normalize to the start of the day
      }

      const timestamp = randomDate.getTime();

      if (!generatedTimestamps.has(timestamp)) {
        generatedTimestamps.add(timestamp);
        generatedDates.push(randomDate);
      }
      maxTries--;
    }

    if (maxTries === 0) {
      setError("Could not generate the requested number of unique dates. Try a larger date/time range.");
      setIsRandomizing(false);
      return;
    }

    generatedDates.sort((a, b) => a.getTime() - b.getTime());

    setTimeout(() => {
      setResults(generatedDates);
      setIsRandomizing(false);
    }, 500); // Fake delay for animation
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
    const resultString = results.map(date => format(date, formatString)).join("\n");
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
          Pick a number of random dates between two dates, with an optional time range.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker label="Start Date" date={startDate} setDate={setStartDate} />
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
                <SelectItem value="MMMM d, yyyy">Long (January 1, 2024)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-xs items-center gap-1.5">
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
          <Switch id="include-time" checked={includeTime} onCheckedChange={setIncludeTime} />
          <Label htmlFor="include-time">Include Time</Label>
        </div>

        {includeTime && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="end-time">End Time</Label>
                <Input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="time-format" checked={is24Hour} onCheckedChange={setIs24Hour} />
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
            shuffledItems={results.map(r => format(r, getFormatString()))}
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
          {isRandomizing ? "Randomizing..." : isRateLimited ? "Please wait..." : "Randomize Dates!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
