
"use client";

import { useState, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, Gift as GiftIcon, Copy, Check, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { getRandomGift, getRandomGiftFromSupabase, GiftResult } from '@/app/actions/gift-randomizer-action';
import { GIFTS_LIST } from '@/lib/gift-data';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import Link from 'next/link';

const RECIPIENTS = [
  'Wife',
  'Husband',
  'Parents',
  'Children',
  'Siblings',
  'Coworkers',
  'New Parents',
  'Others'
];


const uniqueRecipients = ['all', ...RECIPIENTS];


export default function GiftRandomizer() {
  const [recipient, setRecipient] = useState('all');
  const [occasion, setOccasion] = useState('all');
  const [result, setResult] = useState<GiftResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();

  const uniqueOccasions = useMemo(() => {
    const relevantGifts = recipient === 'all'
      ? GIFTS_LIST
      : GIFTS_LIST.filter(g => g.for === recipient);

    const tags = new Set<string>();
    relevantGifts.forEach(gift => {
      gift.tags.forEach(tag => tags.add(tag));
    });

    // console.log(recipient, "\n", relevantGifts, "\n", tags);

    return ['all', ...Array.from(tags).sort()];
  }, [recipient]);


  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_gift_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    try {
      const giftResult = await getRandomGiftFromSupabase(recipient, occasion);
      if (giftResult) {
        setResult(giftResult);
      } else {
        setError("No gifts found for the selected criteria. Try a broader search!");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.item);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'Gift idea copied to clipboard.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Gift Idea Randomizer</CardTitle>
        <CardDescription>
          Find the perfect gift for any person and any occasion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="recipient">For Whom?</Label>
            <Select
              value={recipient}
              onValueChange={(val) => {
                setRecipient(val);
                setOccasion('all');
              }}
              disabled={isLoading || isRateLimited}
            >
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select Recipient" />
              </SelectTrigger>
              <SelectContent>
                {uniqueRecipients.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="occasion">Occasion / Tag</Label>
            <Select
              value={occasion}
              onValueChange={setOccasion}
              disabled={isLoading || isRateLimited}
            >
              <SelectTrigger id="occasion">
                <SelectValue placeholder="Select Occasion" />
              </SelectTrigger>
              <SelectContent>
                {uniqueOccasions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="min-h-[250px] flex items-center justify-center">
          {isLoading && (
            <div className="w-full space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/4 mx-auto" />
              <Skeleton className="h-48 w-full mt-4" />
            </div>
          )}
          {!isLoading && result && (
            <div className="relative w-full text-center p-4 animate-fade-in space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">{result.item}</h3>
              <div className="flex justify-center gap-2 mb-4">
                <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{result.for}</span>
                {result.tags.map(tag => (
                  <span key={tag} className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-full">{tag.replace(/_/g, ' ')}</span>
                ))}
              </div>
              <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={result.imageUrl}
                  alt={result.item}
                  fill
                  className="object-cover"
                />
              </div>

              {result.amazonSearchUrl && (
                <Button asChild>
                  <Link href={result.amazonSearchUrl} target="_blank" rel="noopener noreferrer sponsored">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View on Amazon
                  </Link>
                </Button>
              )}

              <div className="absolute -top-2 right-0">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          )}
          {!isLoading && !result && !error && (
            <div className="text-center text-muted-foreground">
              <GiftIcon className="h-12 w-12 mx-auto mb-4" />
              <p>Click the button to find a random gift idea.</p>
            </div>
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
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Finding a Gift...' : isRateLimited ? 'Please wait...' : 'Randomize Gift Idea'}
        </Button>
      </CardFooter>
    </Card>
  );
}
