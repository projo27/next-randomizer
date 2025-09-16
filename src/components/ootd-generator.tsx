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
import { BrainCircuit, Check, Copy, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateOotd, OotdGeneratorOutput } from "@/ai/flows/ootd-generator-flow";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const GENDERS = ["Pria", "Wanita"];
const STYLES = [
  "Casual",
  "Streetwear",
  "Formal",
  "Bisnis Kasual",
  "Vintage",
  "Bohemian",
  "Minimalis",
  "Sporty",
  "Preppy",
  "Grunge",
];
const SEASONS = ["Musim Kemarau", "Musim Hujan", "Musim Salju", "Musim Gugur", "Musim Semi"];

export default function OotdGenerator() {
  const [gender, setGender] = useState("Pria");
  const [style, setStyle] = useState("Casual");
  const [season, setSeason] = useState("Musim Kemarau");

  const [result, setResult] = useState<OotdGeneratorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    try {
      const response = await generateOotd({ gender, style, season });
      setResult(response);
    } catch (err) {
      setError("Gagal menghasilkan OOTD. Silakan coba lagi nanti.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (!result) return;
    const resultString = `Deskripsi:\n${result.outfitDescription}\n\nItem:\n- ${result.items.join('\n- ')}`;
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Disalin!",
      description: "Rekomendasi OOTD telah disalin.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>OOTD Generator</CardTitle>
        <CardDescription>
          Dapatkan rekomendasi outfit acak berdasarkan gaya dan musim Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender} disabled={isLoading}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Pilih Gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="style">Gaya Busana</Label>
            <Select value={style} onValueChange={setStyle} disabled={isLoading}>
              <SelectTrigger id="style">
                <SelectValue placeholder="Pilih Gaya" />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="season">Musim</Label>
            <Select value={season} onValueChange={setSeason} disabled={isLoading}>
              <SelectTrigger id="season">
                <SelectValue placeholder="Pilih Musim" />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <BrainCircuit className="mr-2 h-4 w-4" />
          {isLoading ? "Sedang Berpikir..." : "Buatkan OOTD Untukku!"}
        </Button>
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
        {result && (
          <Card className="mt-6 w-full bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rekomendasi OOTD-mu</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-card-foreground/90 italic">
                "{result.outfitDescription}"
              </p>
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5" />
                    Item yang Kamu Butuhkan:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-card-foreground/80">
                    {result.items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </CardFooter>
    </Card>
  );
}
