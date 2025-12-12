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
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { AuthUser } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";

const YOUTUBE_CATEGORIES = [
  { categoryId: "1", videoCategory: "Film & Animation" },
  { categoryId: "2", videoCategory: "Autos & Vehicles" },
  { categoryId: "10", videoCategory: "Music" },
  { categoryId: "15", videoCategory: "Pets & Animals" },
  { categoryId: "17", videoCategory: "Sports" },
  { categoryId: "18", videoCategory: "Short Movies" },
  { categoryId: "19", videoCategory: "Travel & Events" },
  { categoryId: "20", videoCategory: "Gaming" },
  { categoryId: "21", videoCategory: "Videoblogging" },
  { categoryId: "22", videoCategory: "People & Blogs" },
  { categoryId: "23", videoCategory: "Comedy" },
  { categoryId: "24", videoCategory: "Entertainment" },
  { categoryId: "25", videoCategory: "News & Politics" },
  { categoryId: "26", videoCategory: "Howto & Style" },
  { categoryId: "27", videoCategory: "Education" },
  { categoryId: "28", videoCategory: "Science & Technology" },
  { categoryId: "29", videoCategory: "Nonprofits & Activism" },
  { categoryId: "30", videoCategory: "Movies" },
  { categoryId: "31", videoCategory: "Anime/Animation" },
  { categoryId: "32", videoCategory: "Action/Adventure" },
  { categoryId: "33", videoCategory: "Classics" },
  { categoryId: "34", videoCategory: "Comedy" },
  { categoryId: "35", videoCategory: "Documentary" },
  { categoryId: "36", videoCategory: "Drama" },
  { categoryId: "37", videoCategory: "Family" },
  { categoryId: "38", videoCategory: "Foreign" },
  { categoryId: "39", videoCategory: "Horror" },
  { categoryId: "40", videoCategory: "Sci-Fi/Fantasy" },
  { categoryId: "41", videoCategory: "Thriller" },
  { categoryId: "42", videoCategory: "Shorts" },
  { categoryId: "43", videoCategory: "Shows" },
  { categoryId: "44", videoCategory: "Trailers" },
];

export default function YouTubeRandomizer() {
  const [categoryId, setCategoryId] = useState("all");
  const [regionCode, setRegionCode] = useState("all");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({
      event: "action_youtube_randomizer",
      user_email: user ? user.email : "guest",
    });
    if (isRandomizing) return;
    triggerRateLimit();
    setIsRandomizing(true);
    setError(null);
    setVideoUrl(null);

    try {
      const queryCategoryId =
        categoryId === "all"
          ? YOUTUBE_CATEGORIES[
              Math.floor(Math.random() * YOUTUBE_CATEGORIES.length)
            ].categoryId
          : categoryId;

      const queryRegionCode =
        regionCode === "all"
          ? COUNTRY_CODES[Math.floor(Math.random() * COUNTRY_CODES.length)].code
          : regionCode;

      const result = await recommendVideo({
        videoCategoryId: queryCategoryId,
        regionCode: queryRegionCode,
      });

      if (result.videoId) {
        setVideoUrl(`https://www.youtube.com/embed/${result.videoId}`);
      } else {
        setError(
          "Could not find a video for this category/region. Please try another one.",
        );
      }
    } catch (err: any) {
      console.error("Failed to get video recommendation:", err);
      setError(
        err.message ||
          "An unexpected error occurred. Please check the console for details.",
      );
    } finally {
      setIsRandomizing(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>YouTube Randomizer</CardTitle>
        <CardDescription>
          Find a random YouTube video to watch from various categories and
          regions. <i>Powered by YouTube Data API</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="youtube-category">Video Category</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={isRandomizing || isRateLimited}
            >
              <SelectTrigger id="youtube-category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories (Random)</SelectItem>
                {YOUTUBE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.videoCategory}
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
              disabled={isRandomizing || isRateLimited}
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

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={handleRandomize}
          disabled={isRandomizing || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing
            ? "Randomizing..."
            : isRateLimited
              ? "Please wait..."
              : "Randomize Video"}
        </Button>
      </CardFooter>
    </Card>
  );
}
