"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Wand2, CalendarIcon, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export default function DateRandomizer() {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [numberOfDates, setNumberOfDates] = useState("3");
  const [results, setResults] = useState<Date[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const { toast } = useToast();

  const handleRandomize = () => {
    setError(null);
    setResults([]);
    setIsResultCopied(false);

    if (!startDate || !endDate) {
      setError("Please select both a start and an end date.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date cannot be after the end date.");
      return;
    }

    const count = parseInt(numberOfDates, 10);
    if (isNaN(count) || count <= 0) {
      setError("Please enter a valid number of dates to generate (must be > 0).");
      return;
    }
    
    // To prevent infinite loops or performance issues
    const dayDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
    if(count > 1000 || count > dayDifference) {
      setError(`Cannot generate more than ${Math.min(1000, dayDifference)} unique dates in this range.`);
      return;
    }


    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    const generatedDates: Date[] = [];
    const generatedTimestamps = new Set();
    
    while(generatedDates.length < count) {
        const randomMs = startMs + Math.random() * (endMs - startMs);
        const randomDate = new Date(randomMs);
        randomDate.setHours(0, 0, 0, 0); // Normalize to the start of the day
        const timestamp = randomDate.getTime();
        
        if (!generatedTimestamps.has(timestamp)) {
            generatedTimestamps.add(timestamp);
            generatedDates.push(randomDate);
        }
    }

    generatedDates.sort((a,b) => a.getTime() - b.getTime());

    setResults(generatedDates);
  };
  
  const handleCopyResult = () => {
    if (results.length === 0) return;
    const resultString = results.map(date => format(date, "PPP")).join("\n");
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
          Pick a number of random dates between two dates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="end-date">End Date</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="num-dates">Number of Dates to Generate</Label>
            <Input
              id="num-dates"
              type="number"
              min="1"
              value={numberOfDates}
              onChange={(e) => setNumberOfDates(e.target.value)}
            />
          </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Randomize Dates!
        </Button>
         {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {results.length > 0 && (
           <Card className="mt-6 border-accent border-2 shadow-lg bg-card/80 w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Random Dates</CardTitle>
                 <Button variant="ghost" size="icon" onClick={handleCopyResult}>
                 {isResultCopied ? (
                   <Check className="h-5 w-5 text-green-500" />
                 ) : (
                   <Copy className="h-5 w-5" />
                 )}
               </Button>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {results.map((date, index) => (
                    <li key={index} className="text-lg">
                      {format(date, "PPP")}
                    </li>
                  ))}
                </ul>
            </CardContent>
          </Card>
        )}
      </CardFooter>
    </Card>
  );
}
