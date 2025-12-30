'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Wand2, LocateFixed, MapPinned, Footprints } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { useSettings } from '@/context/SettingsContext';
import { useRandomizerAudio } from '@/context/RandomizerAudioContext';
import { generateRandomWalk } from '@/ai/flows/random-walk-flow';
import { RandomWalkOutput, RandomWalkInput } from '@/ai/flows/random-walk-types';
import { useToast } from '@/hooks/use-toast';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '480px',
};

export default function RandomWalkGenerator() {
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState(5); // in km
  const [isLoop, setIsLoop] = useState(true);
  const [result, setResult] = useState<RandomWalkOutput | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(8000);
  const { user } = useAuth();
  const { playAudio, stopAudio } = useRandomizerAudio();

  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!isLoading) {
      stopAudio();
    }
  }, [isLoading, stopAudio]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'],
  });

  const handleGetLocation = useCallback(() => {
    setIsGettingLocation(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        if (mapRef.current) {
          mapRef.current.setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          mapRef.current.setZoom(14);
        }
        setIsGettingLocation(false);
        toast({ title: "Location Found", description: "Your current location has been set as the starting point." });
      },
      (geoError) => {
        setError(`Could not get your location: ${geoError.message}. Please set it manually.`);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  }, [toast]);

  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);


  const handleRandomize = async () => {
    if (!startLocation) {
      setError('Please set a starting location first.');
      return;
    }
    if (isLoading || isRateLimited) return;

    sendGTMEvent({ event: 'action_random_walk_randomizer', user_email: user?.email ?? 'guest' });
    triggerRateLimit();
    playAudio();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const input: RandomWalkInput = {
        startLocation,
        distanceKm: distance,
        isLoop,
      };
      const walkResult = await generateRandomWalk(input);
      setResult(walkResult);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while generating the route.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (result && mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(result.bounds.southwest.lat, result.bounds.southwest.lng));
      bounds.extend(new google.maps.LatLng(result.bounds.northeast.lat, result.bounds.northeast.lng));
      mapRef.current.fitBounds(bounds);
    } else if (startLocation && mapRef.current) {
      // Only set center if we are not already close to it?
      // Actually, let's stop auto-centering/zooming here on every startLocation change 
      // because it overrides user pan/zoom when they click.

      mapRef.current.setCenter(startLocation);
      // mapRef.current.setZoom(14);
    }
  }, [result, startLocation]);


  if (loadError) return <Alert variant="destructive"><AlertTitle>Map Error</AlertTitle><AlertDescription>Could not load Google Maps script.</AlertDescription></Alert>;

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Random Walk Generator</CardTitle>
        <CardDescription>
          Discover new paths! Set your start point, choose a distance, and get a random walking route.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Starting Point</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Button onClick={handleGetLocation} disabled={isGettingLocation}>
                <LocateFixed className="mr-2 h-4 w-4" />
                {isGettingLocation ? 'Getting Location...' : 'Use My Location'}
              </Button>
              {startLocation && <p className="text-xs text-muted-foreground">({startLocation.lat.toFixed(4)}, {startLocation.lng.toFixed(4)})</p>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click on the map to set a custom starting point.</p>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="distance-slider">Desired Distance</Label>
              <span className="font-semibold text-primary">{distance} km</span>
            </div>
            <Slider
              id="distance-slider"
              min={1}
              max={20}
              step={1}
              value={[distance]}
              onValueChange={(value) => setDistance(value[0])}
              className="[&&&]:pt-4"
              disabled={isLoading || isRateLimited}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="loop-switch"
              checked={isLoop}
              onCheckedChange={setIsLoop}
              disabled={isLoading || isRateLimited}
            />
            <Label htmlFor="loop-switch">Return to starting point (Loop)</Label>
          </div>
        </div>

        <div className="relative w-full rounded-lg overflow-hidden border">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={startLocation || { lat: 51.5072, lng: -0.1276 }}
              zoom={8}
              onLoad={onMapLoad}
              onClick={(e) => {
                if (e.latLng) {
                  setStartLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                }
              }}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {startLocation && <Marker position={startLocation} />}
              {result && (
                <Polyline
                  path={result.path}
                  options={{
                    strokeColor: "#FF5722",
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <Skeleton className="w-full h-[400px]" />
          )}
        </div>

        {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        {result && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-lg">Your random walk is about <strong className="text-accent">{(result.actualDistanceMeters / 1000).toFixed(2)} km</strong> long.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={handleRandomize}
          disabled={!startLocation || isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Footprints className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating Route...' : isRateLimited ? 'Please wait...' : 'Generate Random Walk'}
        </Button>
      </CardFooter>
    </Card>
  );
}
