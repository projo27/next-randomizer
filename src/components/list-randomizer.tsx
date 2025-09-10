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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AnimatedResult from "./animated-result";
import { Wand2 } from "lucide-react";

export default function ListRandomizer() {
  const [choicesText, setChoicesText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const handleRandomize = () => {
    const currentOptions = choicesText
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (currentOptions.length === 0) {
      setResult(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * currentOptions.length);
    setOptions(currentOptions);
    setResult(currentOptions[randomIndex]);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>List Randomizer</CardTitle>
        <CardDescription>
          Enter your choices below, one per line. We'll pick one for you!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Apples&#10;Bananas&#10;Oranges"
          rows={8}
          value={choicesText}
          onChange={(e) => setChoicesText(e.target.value)}
          className="resize-none"
        />
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleRandomize}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Randomize!
        </Button>
        {result && <AnimatedResult result={result} options={options} />}
      </CardFooter>
    </Card>
  );
}
