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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit } from "lucide-react";
import { summarizeAndRandomizeNews } from "@/ai/flows/summarize-and-randomize-news";
import { Skeleton } from "./ui/skeleton";

export default function RandomNews() {
  const [urls, setUrls] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlList = urls.split("\n").filter((url) => url.trim() !== "");

    if (urlList.length === 0 || !category) {
      setError("Please provide at least one URL and a category.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await summarizeAndRandomizeNews({
        urls: urlList,
        category,
      });
      setResult(response.randomizedSummary);
    } catch (err) {
      setError("Failed to summarize news. Please check the URLs and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Random News Summarizer</CardTitle>
        <CardDescription>
          Enter news article URLs and a category to get a randomized summary.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="urls">Article URLs (one per line)</Label>
            <Textarea
              id="urls"
              placeholder="https://example.com/news-story-1&#10;https://another.com/news-story-2"
              rows={4}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Technology, Politics, Sports"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <BrainCircuit className="mr-2 h-4 w-4" />
            {isLoading ? "Thinking..." : "Summarize & Randomize"}
          </Button>
          {error && <p className="text-destructive text-sm mt-4">{error}</p>}
          {isLoading && (
            <div className="w-full space-y-2 mt-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}
          {result && (
            <Card className="mt-6 w-full bg-card/80">
              <CardHeader>
                <CardTitle>Your Randomized Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground/90 whitespace-pre-wrap">
                  {result}
                </p>
              </CardContent>
            </Card>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
