
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
import { Wand2, Gift as GiftIcon, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { getRandomGift, Gift } from '@/app/actions/gift-randomizer-action';
import { GIFTS_LIST } from '@/lib/gift-data';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';

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

const OCCASIONS = [
  'anniversary', 'valentine', 'birthday', 'thank_you', 'christmas', 'home', 
  'romantic', 'luxury', 'memory', 'fashion', 'reading', 'monthly', 'surprise', 
  'comfort', 'practical', 'activity', 'fun', 'art', 'casual', 'health', 'tech', 
  'new_year', 'spa', 'relaxation', 'unique', 'summer', 'winter', 'random', 
  'grooming', 'outdoor', 'adventure', 'gaming', 'sport', 'everyday', 'nostalgia', 
  'coffee', 'travel', 'funny', 'automotive', 'work', 'organization', 'music', 
  'entertainment', 'sentimental', 'school', 'aesthetic', 'team_building', 'eco_friendly', 
  'inspiration', 'Baby Shower', 'Newborn Arrival', 'Memory Gift', 'Practical Gift', 
  'Postpartum Support', 'Self-care', 'New Mom Gift', 'Family Gift', 'Safety Gift', 
  'Tech Gift', 'Nursery Decor', 'Sleep Gift', 'Travel Gift', 'Care Gift', 
  'Photography Gift', 'Comfort Gift', 'Gift of Love', 'Appreciation', 
  'Memorial', 'Housewarming', 'Wellness Gift', 'Sustainability', 'Fitness Gift', 
  'Brain Teaser', 'Postpartum Care'
];

// Get unique values and sort them
const uniqueRecipients = ['all', ...RECIPIENTS];
const uniqueOccasions = ['all', ...Array.from(new Set(OCCASIONS))].sort();

function getImageHint(itemName: string): string {
    // A simple function to extract a couple of keywords from the gift item name.
    const lowerCaseItem = itemName.toLowerCase();
    const commonWords = new Set(['a', 'an', 'the', 'with', 'for', 'or', 'and', 'of', 'set', 'kit']);
    const words = lowerCaseItem.split(' ').filter(word => !commonWords.has(word));
    
    if (words.length >= 2) {
        // Prefer taking the first adjective/noun and the last noun. This is a heuristic.
        return `${words[0]} ${words[words.length - 1]}`;
    }
    if (words.length === 1) {
        return words[0];
    }
    return 'gift present'; // Fallback
}


export default function GiftRandomizer() {
  const [recipient, setRecipient] = useState('all');
  const [occasion, setOccasion] = useState('all');
  const [result, setResult] = useState<Gift | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();
  
  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_gift_randomizer', user_email: user?.email ?? 'guest' });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    try {
      const giftResult = await getRandomGift(recipient, occasion);
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

  const imageSeed = useMemo(() => Math.floor(Math.random() * 1000) + 1, [result]);
  const imageHint = result ? getImageHint(result.item) : "gift present";

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
              onValueChange={setRecipient}
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
            <div className="relative w-full text-center p-4 animate-fade-in">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">{result.item}</h3>
              <div className="flex justify-center gap-2 mb-4">
                <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{result.for}</span>
                {result.tags.map(tag => (
                  <span key={tag} className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-full">{tag.replace(/_/g, ' ')}</span>
                ))}
              </div>
              <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden border-2 border-accent shadow-lg">
                <Image
                  src={`https://picsum.photos/seed/${imageSeed}/600/400`}
                  alt={result.item}
                  fill
                  className="object-cover"
                  data-ai-hint={imageHint}
                />
              </div>
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
