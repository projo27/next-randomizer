
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
import { Map, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { getRandomPlace, LatLng } from "@/app/actions/maps-randomizer-action";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { useAuth } from "@/context/AuthContext";
import { sendGTMEvent } from "@next/third-parties/google";

export default function MapsRandomizer() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleRandomize = async () => {
    sendGTMEvent({ event: "action_maps_randomizer", user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;
    
    if (!apiKey) {
      setError("Google Maps API Key is not configured. Please set it in the environment variables.");
      return;
    }

    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setLocation(null);
    setMapUrl(null);

    try {
      const newLocation = await getRandomPlace();
      setLocation(newLocation);
      
      const embedUrl = new URL("https://www.google.com/maps/embed/v1/view");
      embedUrl.searchParams.set("key", apiKey);
      embedUrl.searchParams.set("center", `${newLocation.lat},${newLocation.lng}`);
      embedUrl.searchParams.set("zoom", "18");
      embedUrl.searchParams.set("maptype", "satellite");
      
      setMapUrl(embedUrl.toString());

    } catch (err: any) {
      setError("Could not get a random place. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Google Maps Place Randomizer</CardTitle>
        <CardDescription>
          Discover a random place on Earth with a 3D satellite view.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="aspect-video w-full bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
          {isLoading && <Skeleton className="w-full h-full" />}
          {!isLoading && mapUrl && (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={mapUrl}
              className="animate-fade-in"
            ></iframe>
          )}
          {!isLoading && !mapUrl && (
            <div className="text-center text-muted-foreground p-4">
              <Map className="h-12 w-12 mx-auto mb-4" />
              <p>Your random destination will appear here.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? "Finding a place..." : isRateLimited ? "Please wait..." : "Randomize Place"}
        </Button>
      </CardFooter>
    </Card>
  );
}
