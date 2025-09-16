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
import { recommendVideo } from "@/app/actions/youtube-actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { COUNTRY_CODES } from "@/lib/country-codes";

const YOUTUBE_CATEGORIES = [
    "Music",
    "Comedy",
    "Gaming",
    "Science & Technology",
    "Movie Trailers",
    "Documentaries",
    "Travel Vlogs",
    "Cooking Tutorials",
    "DIY & Crafts",
    "Film & Animation",
    "Autos & Vehicles",
    "Pets & Animals",
    "Sports",
    "Entertainment",
    "News & Politics",
    "Howto & Style",
    "Education",
    "People & Blogs"
];


export default function YouTubeRandomizer() {
  const [category, setCategory] = useState("all");
  const [regionCode, setRegionCode] = useState("all");
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

        const queryRegionCode = regionCode === 'all'
            ? undefined
            : regionCode;

        const result = await recommendVideo({ category: queryCategory, regionCode: queryRegionCode });
        
        if (result.videoId) {
            setVideoUrl(`https://www.youtube.com/embed/${result.videoId}`);
        } else {
            setError("Could not find a video for this category/region. Please try another one.");
        }

    } catch (err: any) {
        console.error("Failed to get video recommendation:", err);
        setError(err.message || "An unexpected error occurred. Please check the console for details.");
    } finally {
        setIsRandomizing(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>YouTube Randomizer</CardTitle>
        <CardDescription>
          Find a random YouTube video to watch from various categories and regions. <i>Powered by YouTube Data API</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
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
             <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="youtube-region">Region</Label>
            <Select
                value={regionCode}
                onValueChange={setRegionCode}
                disabled={isRandomizing}
            >
                <SelectTrigger id="youtube-region">
                <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRY_CODES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                    {country.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
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
