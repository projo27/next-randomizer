'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, GitBranch } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { drawTarotCards, DrawnCard } from '@/app/actions/tarot-randomizer-action';
import { useSettings } from '@/context/SettingsContext';
import { useRandomizerAudio } from '@/context/RandomizerAudioContext';
import { threwConfetti } from '@/lib/confetti';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export default function TarotRandomizer() {
  const [count, setCount] = useState('3');
  const [results, setResults] = useState<DrawnCard[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  const { animationDuration, confettiConfig } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();

  useEffect(() => {
    if (!isRandomizing) {
      stopAudio();
    }
  }, [isRandomizing, stopAudio]);

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_tarot_randomizer', user_email: user?.email ?? 'guest' });
    if (isRandomizing || isRateLimited) return;
    
    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount <= 0 || numCount > 10) {
      setError('Please enter a number between 1 and 10.');
      return;
    }

    triggerRateLimit();
    playAudio();
    setError(null);
    setIsRandomizing(true);
    setResults([]);

    try {
      const newResults = await drawTarotCards(numCount);
      setTimeout(() => {
        setResults(newResults);
        setIsRandomizing(false);
        if (confettiConfig.enabled) {
          threwConfetti({
            particleCount: confettiConfig.particleCount,
            spread: confettiConfig.spread,
          });
        }
      }, animationDuration * 1000);
    } catch (e: any) {
      setError(e.message);
      setIsRandomizing(false);
      stopAudio();
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Tarot Card Reading</CardTitle>
        <CardDescription>Draw random tarot cards to get insight and guidance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="tarot-count">Number of Cards to Draw</Label>
          <Input
            id="tarot-count"
            type="number"
            min="1"
            max="10"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            disabled={isRandomizing || isRateLimited}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative flex flex-wrap justify-center items-center gap-4 min-h-[250px] p-4 bg-muted/50 rounded-lg">
          {isRandomizing && Array.from({ length: parseInt(count) || 3 }).map((_, i) => (
            <Skeleton key={i} className="w-[120px] h-[210px]" />
          ))}

          {!isRandomizing && results.length > 0 && results.map((card, index) => (
            <Dialog key={card.id}>
              <DialogTrigger asChild>
                <div
                  className="relative w-[120px] h-[210px] cursor-pointer group animate-reveal-card"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute inset-0 bg-primary rounded-lg flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/images/tarot_back.png"
                      alt="Tarot card back"
                      width={120}
                      height={210}
                      className="object-contain"
                    />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center">{card.name} - <span className={cn(card.orientation === 'reversed' && 'text-red-500')}>{card.orientation}</span></DialogTitle>
                  <DialogDescription className="text-center">{card.short_description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 items-center" style={{ gridTemplateColumns: '150px 1fr' }}>
                   <div className={cn("relative w-[150px] h-[262px]", card.orientation === 'reversed' && 'rotate-180')}>
                    <Image
                      src={card.image_url}
                      alt={card.name}
                      fill
                      data-ai-hint={card.image_hint}
                      className="object-contain rounded-md"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground max-h-[262px] overflow-y-auto pr-4">
                    <p>{card.orientation === 'upright' ? card.description.upright : card.description.reversed}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
          
          {!isRandomizing && results.length === 0 && (
            <div className="text-center text-muted-foreground p-4">
              <GitBranch className="h-16 w-16 mx-auto mb-4" />
              <p>Your destiny awaits. Draw some cards.</p>
            </div>
          )}
        </div>

      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          onClick={handleRandomize}
          disabled={isRandomizing || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing ? 'Drawing cards...' : 'Draw Tarot Cards'}
        </Button>
      </CardFooter>
    </Card>
  );
}
