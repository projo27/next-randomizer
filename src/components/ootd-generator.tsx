"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrainCircuit, Check, Copy, Package, Image as ImageIcon, Sparkles, Mars, Venus, Ghost, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateOotd, generateOotdImage, OotdGeneratorOutput } from "@/ai/flows/ootd-generator-flow";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { cn } from "@/lib/utils";

const GENDERS = ["Male", "Female", "Unisex"];
const ICONS = [<Mars />, <Venus />, <Ghost />]
const STYLES = [
  "All",
  "Casual",
  "Streetwear",
  "Formal",
  "Business Casual",
  "Vintage",
  "Bohemian",
  "Minimalist",
  "Sporty",
  "Preppy",
  "Grunge",
];
const SEASONS = ["Dry Season", "Rainy Season", "Snowy Season", "Autumn", "Spring"];

const POSES = [
  "walking confidently with a purposeful stride",
  "mid-stride, as if caught in a natural moment",
  "turning slightly to look back over their shoulder",
  "jumping lightly, with a sense of energy",
  "running or jogging, with a dynamic feel",
  "standing casually with hands in pockets",
  "leaning against a wall or a railing",
  "sitting on a stool with a relaxed posture",
  "standing with arms crossed and a relaxed expression",
  "looking away, creating a sense of a candid shot",
  "standing tall and still like a statue",
  "striking a powerful fashion model pose",
  "one hand on their hip, with a confident stance",
  "in a contemplative pose, looking down",
];

const CAMERA_ANGLES = [
  "a direct frontal view, straight on",
  "from a low angle, making the person look powerful",
  "from a high angle, giving a slightly elevated perspective",
  "from a waist-up, direct frontal view",
  "from a slight front-diagonal angle",
  "a full body shot from a dynamic front-diagonal view",
  "a dramatic front-diagonal shot from a low angle",
  "from a wide angle, capturing the person from a front-diagonal perspective",
  "a cinematic shot with a wide-angle lens",
  "a close-up portrait from a front-diagonal angle",
]

export default function OotdGenerator() {
  const [gender, setGender] = useState("Female");
  const [style, setStyle] = useState("All");
  const [season, setSeason] = useState("Dry Season");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("60");

  const [result, setResult] = useState<OotdGeneratorOutput | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const handleGenerate = async () => {
    if (isLoading) return;
    triggerRateLimit();

    const heightNum = parseInt(height, 10);
    const weightNum = parseInt(weight, 10);

    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      setError("Please enter a valid height and weight.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setImageUrl(null);
    setIsCopied(false);
    setIsGeneratingImage(false);

    try {
      // Generate text description first
      const response = await generateOotd({ gender, style, season, height: heightNum, weight: weightNum });
      setResult(response);
      setIsLoading(false); // Stop main loading state

      // Start async image generation
      setIsGeneratingImage(true);
      generateOotdImage({
        outfitDescription: response.outfitDescription,
        gender,
        height: heightNum,
        weight: weightNum,
        items: response.items,
        weightHealth: response.weightHealth,
        pose: POSES[Math.floor(Math.random() * POSES.length)],
        cameraAngle: CAMERA_ANGLES[Math.floor(Math.random() * CAMERA_ANGLES.length)],
      })
        .then(imageResponse => {
          setImageUrl(imageResponse.imageUrl);
        })
        .catch(err => {
          console.error("Image generation failed:", err);
          toast({
            variant: 'destructive',
            title: 'Image Generation Failed',
            description: 'Could not generate the outfit image. Please try again later.'
          });
        })
        .finally(() => {
          setIsGeneratingImage(false);
        });

    } catch (err) {
      setError("Failed to generate OOTD. Please try again later.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const resultString = `Style: ${result.styleUsed}\n\nDescription:\n${result.outfitDescription}\n\nItems:\n- ${result.items.join('\n- ')}`;
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "OOTD recommendation has been copied.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>OOTD Generator</CardTitle>
        <CardDescription>
          Get a random AI-powered outfit recommendation based on your style and the season. <i>Powered by Gemini</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender} disabled={isLoading || isRateLimited}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g, idx) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="style">Fashion Style</Label>
            <Select value={style} onValueChange={setStyle} disabled={isLoading || isRateLimited}>
              <SelectTrigger id="style">
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="season">Season</Label>
            <Select value={season} onValueChange={setSeason} disabled={isLoading || isRateLimited}>
              <SelectTrigger id="season">
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="height">Height (cm)</Label>
            <Input id="height" type="number" placeholder="e.g., 175" value={height} onChange={(e) => setHeight(e.target.value)} disabled={isLoading || isRateLimited} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" placeholder="e.g., 70" value={weight} onChange={(e) => setWeight(e.target.value)} disabled={isLoading || isRateLimited} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">

        {error && (
          <Alert variant="destructive" className="mt-4 w-full">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading && (
          <div className="w-full space-y-4 mt-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="pt-4 space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
        )}
        {(result || isGeneratingImage) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2 w-full">
            <Card className="bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your OOTD Recommendation</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Badge>{result?.styleUsed}</Badge>
                </div>
                <p className="text-card-foreground/90 italic">
                  "{result?.outfitDescription}"
                </p>
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5" />
                    Items You'll Need:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-card-foreground/80">
                    {result?.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Outfit Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square relative rounded-md overflow-hidden bg-muted flex items-center justify-center group">
                  {isGeneratingImage && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-8 w-8 animate-pulse" />
                      <p>Generating image...</p>
                    </div>
                  )}
                  {imageUrl && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="cursor-pointer">
                          <Image src={imageUrl} alt="Generated outfit" fill className="object-cover animate-fade-in" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="h-12 w-12 text-white" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl p-0">
                        <DialogTitle className="sr-only">Outfit Visualization Zoom</DialogTitle>
                        <DialogDescription className="sr-only">A larger view of the generated outfit image.</DialogDescription>
                        <Image src={imageUrl} alt="Generated outfit" width={1024} height={1024} className="rounded-md object-contain" />
                      </DialogContent>
                    </Dialog>
                  )}
                  {!isGeneratingImage && !imageUrl && result && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground text-center p-4">
                      <ImageIcon className="h-8 w-8" />
                      <p>Image will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <Button
          onClick={handleGenerate}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isLoading ? "Thinking..." : isRateLimited ? "Please wait..." : "Generate my OOTD!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
