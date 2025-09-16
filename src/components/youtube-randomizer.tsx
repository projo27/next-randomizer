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
import { YOUTUBE_CATEGORIES, ALL_VIDEO_IDS } from "@/lib/youtube-data";

export default function YouTubeRandomizer() {
  const [category, setCategory] = useState("all");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const handleRandomize = () => {
    setIsRandomizing(true);
    let videoId: string;

    if (category === "all") {
      // Pick from all available videos
      const randomIndex = Math.floor(Math.random() * ALL_VIDEO_IDS.length);
      videoId = ALL_VIDEO_IDS[randomIndex];
    } else {
      // Pick from the selected category
      const categoryVideos = YOUTUBE_CATEGORIES[category as keyof typeof YOUTUBE_CATEGORIES];
      const randomIndex = Math.floor(Math.random() * categoryVideos.length);
      videoId = categoryVideos[randomIndex];
    }

    // Fake delay for visual effect
    setTimeout(() => {
      setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
      setIsRandomizing(false);
    }, 500);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>YouTube Randomizer</CardTitle>
        <CardDescription>
          Find a random YouTube video to watch from various categories.
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
              <SelectItem value="all">All</SelectItem>
              {Object.keys(YOUTUBE_CATEGORIES).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                    className="rounded-lg"
                ></iframe>
            ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
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
