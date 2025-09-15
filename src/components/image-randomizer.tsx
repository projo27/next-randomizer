
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import { Wand2, Upload, Play, Pause, Square } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ImageRandomizer() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [duration, setDuration] = useState("5");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => {
      imageUrls.forEach(URL.revokeObjectURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrls]);

  useEffect(() => {
    if (isPlaying && imageUrls.length > 1) {
      const ms = parseInt(duration, 10) * 1000;
      if (isNaN(ms) || ms < 1000) {
        toast({ title: "Invalid duration", description: "Duration must be at least 1 second.", variant: "destructive" });
        setIsPlaying(false);
        return;
      }
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, ms);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, imageUrls.length, duration, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    handleStop();
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      const validImageFiles = files.filter(file => imageMimeTypes.includes(file.type));

      if (validImageFiles.length !== files.length) {
          setError("Some selected files were not valid image types and have been ignored.");
      }
      if (validImageFiles.length === 0) {
          setError("No valid image files selected.");
          return;
      }

      const shuffledFiles = shuffleArray(validImageFiles);
      setImageFiles(shuffledFiles);

      // Clean up old URLs before creating new ones
      imageUrls.forEach(URL.revokeObjectURL);
      const newImageUrls = shuffledFiles.map(file => URL.createObjectURL(file));
      setImageUrls(newImageUrls);
      setCurrentIndex(0);
    }
  };

  const handlePlayPause = () => {
    if (imageUrls.length < 2) {
      toast({ title: "Not enough images", description: "Please select at least 2 images to start the slideshow.", variant: "destructive"});
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
      setIsPlaying(false);
      setCurrentIndex(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Image Slideshow Randomizer</CardTitle>
        <CardDescription>
          Select images from your computer to create a random slideshow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex w-full items-end gap-2">
                <Input
                    ref={fileInputRef}
                    id="image-files"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Button onClick={handleUploadClick} variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Select Images ({imageFiles.length})
                </Button>
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="duration">Slideshow Duration (seconds)</Label>
                <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={isPlaying}
                />
            </div>
        </div>

        <div className="relative w-full aspect-video bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
          {imageUrls.length > 0 ? (
            imageUrls.map((url, index) => (
              <Image
                key={url}
                src={url}
                alt={`Random image ${index + 1}`}
                fill
                className={`object-contain transition-opacity duration-1000 ${index === currentIndex ? "animate-fade-in" : "opacity-0"}`}
              />
            ))
          ) : (
            <p className="text-muted-foreground">Your images will appear here</p>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col md:flex-row gap-2">
             <Button
                onClick={handlePlayPause}
                disabled={imageUrls.length < 1}
                className="w-full"
            >
                {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isPlaying ? "Pause" : "Play Slideshow"}
            </Button>
             <Button
                onClick={handleStop}
                disabled={imageUrls.length < 1}
                variant="destructive"
                className="w-full md:w-auto"
            >
                <Square className="mr-2 h-4 w-4" />
                Stop
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
