
'use client';

import { useState } from 'react';
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
import { Wand2, User, Shield, Calendar, MapPin, Trophy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomFootballer, FootballerResult } from '@/app/actions/sport-randomizer-action';
import { Badge } from './ui/badge';

function FootballerCard({ result }: { result: FootballerResult }) {
    return (
        <Card className="w-full max-w-lg mx-auto animate-fade-in bg-card/50 overflow-hidden">
            <div className="relative h-48 bg-muted">
                {result.strFanart1 ? (
                    <Image
                        src={result.strFanart1}
                        alt={`Background for ${result.strPlayer}`}
                        fill
                        className="object-cover opacity-30"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20"></div>
                )}
                <div className="absolute bottom-4 left-4 flex items-end gap-4">
                    <div className="relative h-24 w-24 rounded-full bg-background border-2 border-primary shadow-lg overflow-hidden">
                       {result.strCutout ? (
                            <Image
                                src={result.strCutout}
                                alt={result.strPlayer}
                                fill
                                className="object-cover"
                            />
                       ) : (
                           <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                               <User className="h-12 w-12"/>
                           </div>
                       )}
                    </div>
                    {result.strTeamBadge && (
                        <div className="relative h-16 w-16">
                            <Image
                                src={result.strTeamBadge}
                                alt={`${result.strTeam} badge`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                </div>
            </div>
            <CardHeader>
                <CardTitle className="text-3xl">{result.strPlayer}</CardTitle>
                <CardDescription className="text-md">{result.strNationality}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-accent" />
                    <span>Plays for <strong>{result.strTeam}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>Position: <strong>{result.strPosition}</strong></span>
                </div>
                 <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-accent" />
                    <span>Born on: <strong>{result.dateBorn || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-accent" />
                    <span>League: <Badge variant="secondary">{result.strLeague}</Badge></span>
                </div>
                {result.strDescriptionEN && (
                    <p className="text-sm text-muted-foreground pt-2 italic line-clamp-3">
                        {result.strDescriptionEN}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default function SportRandomizer() {
  const [result, setResult] = useState<FootballerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, triggerRateLimit] = useRateLimiter(4000);
  const { user } = useAuth();

  const handleRandomize = async () => {
    sendGTMEvent({
      event: 'action_sport_randomizer',
      user_email: user?.email ?? 'guest',
    });
    if (isLoading || isRateLimited) return;
    triggerRateLimit();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const newResult = await getRandomFootballer();
      setResult(newResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Football Player Randomizer</CardTitle>
        <CardDescription>
          Discover a random football player from one of Europe's top leagues. <i>Powered by TheSportsDB.com</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex items-center justify-center">
        {isLoading && (
            <div className="w-full max-w-lg mx-auto space-y-4">
                <div className="relative h-48 w-full"><Skeleton className="h-full w-full"/></div>
                <div className="p-6 space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <div className="pt-4 space-y-3">
                        <Skeleton className="h-5 w-full"/>
                        <Skeleton className="h-5 w-2/3"/>
                    </div>
                </div>
            </div>
        )}
        {!isLoading && result && <FootballerCard result={result} />}

        {!isLoading && !result && !error && (
          <p className="text-muted-foreground">
            Click the button to get a random player.
          </p>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Oops! An Error Occurred</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleRandomize}
          disabled={isLoading || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading
            ? 'Finding a Player...'
            : isRateLimited
            ? 'Please wait...'
            : 'Randomize Player'}
        </Button>
      </CardFooter>
    </Card>
  );
}
