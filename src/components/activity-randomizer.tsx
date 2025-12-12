
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wand2, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomActivity, Activity } from '@/app/actions/activity-randomizer-action';
import { ACTIVITIES } from '@/lib/activity-data';
import { Slider } from './ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/context/SettingsContext';
import { useRandomizerAudio } from '@/context/RandomizerAudioContext';
import { threwConfetti } from '@/lib/confetti';

const LEVEL_DESCRIPTIONS: { [key: number]: string } = {
  1: 'Very Light & Silly',
  2: 'Light & Easy',
  3: 'Moderate',
  4: 'Challenging',
  5: 'Adventurous',
};

export default function ActivityRandomizer() {
  const [level, setLevel] = useState(3);
  const [result, setResult] = useState<Activity | null>(null);
  const [displayActivity, setDisplayActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  const { animationDuration, confettiConfig } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup interval on component unmount or when loading stops
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_activity_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;

    triggerRateLimit();
    playAudio();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    // Start shuffling animation
    animationIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * ACTIVITIES.length);
      setDisplayActivity(ACTIVITIES[randomIndex]);
    }, 100);

    try {
      const activityResult = await getRandomActivity(level);

      // Stop animation after the duration and show the final result
      setTimeout(() => {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
        }
        setResult(activityResult);
        setDisplayActivity(activityResult);
        setIsLoading(false);
        stopAudio();
        if (confettiConfig.enabled) {
          threwConfetti({
            particleCount: confettiConfig.particleCount,
            spread: confettiConfig.spread,
          });
        }
      }, animationDuration * 1000);

    } catch (err: any) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
      setIsLoading(false);
      stopAudio();
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.activity);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'Activity copied to clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const activityToShow = isLoading ? displayActivity : result;

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Today's Activity Randomizer</CardTitle>
        <CardDescription>
          Get a random idea for something to do today. Adjust the slider to match your energy level!
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[300px] flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="level-slider" className="text-base">
              Activity Level
            </Label>
            <span className="font-semibold text-primary">{LEVEL_DESCRIPTIONS[level]}</span>
          </div>
          <Slider
            id="level-slider"
            min={1}
            max={5}
            step={1}
            value={[level]}
            onValueChange={(value) => setLevel(value[0])}
            className="[&&&]:pt-4"
            disabled={isLoading || isRateLimited}
          />
        </div>

        <div className="w-full flex-grow flex items-center justify-center p-4">
          {activityToShow && (
            <div className="relative w-full text-center p-4 animate-fade-in">
              <blockquote className="text-2xl md:text-3xl font-bold text-accent italic">
                "{activityToShow.activity}"
              </blockquote>
              {!isLoading && result && (
                <div className="absolute -top-2 right-0">
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              )}
            </div>
          )}
          {!isLoading && !activityToShow && !error && (
            <p className="text-muted-foreground text-center">
              Adjust the slider and click the button to get a random activity.
            </p>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Oops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Thinking...' : isRateLimited ? 'Please wait...' : 'Randomize Activity'}
        </Button>
      </CardFooter>
    </Card>
  );
}
