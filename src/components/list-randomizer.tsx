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
import { Wand2, Copy, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ListRandomizer() {
  const [choicesText, setChoicesText] = useState(`Apples
Bananas
Oranges`);
  const [result, setResult] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isInputCopied, setIsInputCopied] = useState(false);
  const { toast } = useToast();

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

  const handleCopyInput = () => {
    navigator.clipboard.writeText(choicesText);
    setIsInputCopied(true);
    toast({
      title: "Copied!",
      description: "Input list copied to clipboard.",
    });
    setTimeout(() => setIsInputCopied(false), 2000);
  };

  const handleClearInput = () => {
    setChoicesText("");
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
        <div className="relative">
          <Textarea
            placeholder={``}
            rows={8}
            value={choicesText}
            onChange={(e) => setChoicesText(e.target.value)}
            className="resize-none pr-20"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopyInput}>
              {isInputCopied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClearInput}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
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
