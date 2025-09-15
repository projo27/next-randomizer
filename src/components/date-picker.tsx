"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "./ui/label";

interface DatePickerProps {
  label: string;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DatePicker({ label, date, setDate }: DatePickerProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor={`date-picker-${label.toLowerCase().replace(" ", "-")}`}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={`date-picker-${label.toLowerCase().replace(" ", "-")}`}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
