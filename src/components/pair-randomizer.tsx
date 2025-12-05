'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wand2, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useSettings } from '@/context/SettingsContext';
import { useRandomizerAudio } from '@/context/RandomizerAudioContext';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { randomizePairs, Pair } from '@/app/actions/pair-randomizer-action';
import { Skeleton } from './ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PresetManager } from './preset-manager';
import type { PairPresetParams } from '@/types/presets';

const initialListA = 'Jump Rope\nPush Up\nSquat Jump\nShuttle Run\nPlank';
const initialListB = '45s\n30s\n20s';

export default function PairRandomizer() {
  const [listA, setListA] = useState(initialListA);
  const [listB, setListB] = useState(initialListB);
  const [result, setResult] = useState<Pair[] | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();

  const getCurrentParams = (): PairPresetParams => ({
    listA,
    listB,
  });

  const handleLoadPreset = (params: any) => {
    const p = params as PairPresetParams;
    setListA(p.listA);
    setListB(p.listB);
    // toast({ title: "Preset Loaded", description: "Your settings have been restored." });
  };

  const handleRandomize = async () => {
    sendGTMEvent({
      event: 'action_pair_randomizer',
      user_email: user?.email ?? 'guest',
    });
    if (isRandomizing || isRateLimited) return;

    const itemsA = listA.split('\n').filter(Boolean);
    const itemsB = listB.split('\n').filter(Boolean);

    if (itemsA.length === 0 || itemsB.length === 0) {
      setError('Please provide at least one item in both lists.');
      return;
    }

    triggerRateLimit();
    playAudio();
    setError(null);
    setIsCopied(false);
    setIsRandomizing(true);
    setResult(null);

    try {
      const pairResult = await randomizePairs(itemsA, itemsB);
      setTimeout(() => {
        setResult(pairResult);
        setIsRandomizing(false);
        stopAudio();
      }, animationDuration * 1000);
    } catch (err: any) {
      setError(err.message);
      setIsRandomizing(false);
      stopAudio();
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = result.map(pair => `${pair.itemA} - ${pair.itemB}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'Pairs copied to clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Pair Randomizer</CardTitle>
        <CardDescription>
          Create random pairs from two different lists. Items from the shorter list will be reused.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PresetManager
          toolId="pair"
          currentParams={getCurrentParams()}
          onLoadPreset={handleLoadPreset}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="list-a">List 1</Label>
            <Textarea
              id="list-a"
              rows={6}
              value={listA}
              onChange={(e) => setListA(e.target.value)}
              disabled={isRandomizing || isRateLimited}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="list-b">List 2</Label>
            <Textarea
              id="list-b"
              rows={6}
              value={listB}
              onChange={(e) => setListB(e.target.value)}
              disabled={isRandomizing || isRateLimited}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative">
          {(isRandomizing || result) && (
            <div className="absolute top-2 right-2">
              <Button variant="ghost" size="icon" onClick={handleCopy} disabled={isRandomizing}>
                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          )}
          <div className="min-h-[200px] px-4 py-10 bg-muted/50 rounded-lg">
            {isRandomizing && (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}
            {!isRandomizing && result && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>List 1</TableHead>
                    <TableHead>List 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.map((pair, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{pair.itemA}</TableCell>
                      <TableCell>{pair.itemB}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isRandomizing && !result && !error && (
              <div className="flex items-center justify-center h-full min-h-[150px]">
                <p className="text-muted-foreground">Your random pairs will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isRandomizing || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isRandomizing ? 'Pairing...' : isRateLimited ? 'Please wait...' : 'Randomize Pairs'}
        </Button>
      </CardFooter>
    </Card>
  );
}
