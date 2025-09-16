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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Youtube } from "lucide-react";
import { recommendVideo } from "@/ai/flows/youtube-video-recommender-flow";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const YOUTUBE_CATEGORIES = [
    "Music",
    "Comedy",
    "Gaming",
    "Science & Technology",
    "Movie Trailers",
    "Documentaries",
    "Travel Vlogs",
    "Cooking Tutorials",
    "DIY & Crafts"
];


export default function YouTubeRandomizer() {
  const [category, setCategory] = useState("all");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRandomize = async () => {
    setIsRandomizing(true);
    setError(null);
    setVideoUrl(null);

    try {
        const queryCategory = category === 'all' 
            ? YOUTUBE_CATEGORIES[Math.floor(Math.random() * YOUTUBE_CATEGORIES.length)]
            : category;

        const result = await recommendVideo({ category: queryCategory });
        
        if (result.videoId) {
            setVideoUrl(`https://www.youtube.com/embed/${result.videoId}`);
        } else {
            setError("Could not find a video for this category. Please try another one.");
        }

    } catch (err) {
        console.error("Failed to get video recommendation:", err);
        setError("Sorry, I couldn't get a video right now. Please check if the API key is set up correctly and try again.");
    } finally {
        setIsRandomizing(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>YouTube Randomizer</CardTitle>
        <CardDescription>
          Find a random YouTube video to watch from various categories. <i>Powered by YouTube Data API</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="youtube-category">Video Category</Label>
          <Select
            value={category}
            onValueChange={setCategory}
            disabled={isRandomizing}
          >
            <SelectTrigger id="youtube-category">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories (Random)</SelectItem>
              {YOUTUBE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="aspect-video w-full bg-muted/50 rounded-lg flex items-center justify-center">
            {isRandomizing ? (
                 <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Youtube className="h-12 w-12 animate-pulse" />
                    <p>Finding a video...</p>
                 </div>
            ) : videoUrl ? (
                <iframe
                    width="100%"
                    height="100%"
                    src={videoUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg animate-fade-in"
                ></iframe>
            ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground text-center px-4">
                    <Youtube className="h-12 w-12" />
                    <p>Your random video will appear here</p>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isRandomizing}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing ? "Randomizing..." : "Randomize Video"}
        </Button>
      </CardFooter>
    </Card>
  );
}
