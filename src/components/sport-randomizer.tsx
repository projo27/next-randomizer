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
import { Wand2, User, Shield, Calendar, MapPin, Trophy, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { getRandomTeam, getRandomPlayerFromTeam, Team, FootballerResult } from '@/app/actions/sport-randomizer-action';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';


function TeamCard({ team }: { team: Team }) {
    return (
        <Card className="w-full max-w-md mx-auto animate-fade-in bg-card/50 overflow-hidden">
            <CardHeader className="text-center">
                 <div className="relative h-24 w-24 mx-auto">
                    {team.strTeamBadge ? (
                        <Image
                            src={team.strTeamBadge}
                            alt={`${team.strTeam} badge`}
                            fill
                            className="object-contain"
                        />
                    ) : (
                        <Shield className="h-full w-full text-muted-foreground"/>
                    )}
                </div>
                <CardTitle className="text-2xl mt-2">{team.strTeam}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{team.strLeague}</Badge>
                </CardDescription>
            </CardHeader>
        </Card>
    );
}


function PlayerCard({ player }: { player: FootballerResult }) {
    return (
        <Card className="w-full max-w-lg mx-auto animate-fade-in bg-card/50 overflow-hidden mt-4">
            <div className="relative h-48 bg-muted">
                {player.strFanart1 ? (
                    <Image
                        src={player.strFanart1}
                        alt={`Background for ${player.strPlayer}`}
                        fill
                        className="object-cover opacity-30"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20"></div>
                )}
                <div className="absolute bottom-4 left-4 flex items-end gap-4">
                    <div className="relative h-24 w-24 rounded-full bg-background border-2 border-primary shadow-lg overflow-hidden">
                       {player.strCutout ? (
                            <Image
                                src={player.strCutout}
                                alt={player.strPlayer}
                                fill
                                className="object-cover"
                            />
                       ) : (
                           <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                               <User className="h-12 w-12"/>
                           </div>
                       )}
                    </div>
                </div>
            </div>
            <CardHeader>
                <CardTitle className="text-3xl">{player.strPlayer}</CardTitle>
                <CardDescription className="text-md">{player.strNationality}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>Position: <strong>{player.strPosition || 'N/A'}</strong></span>
                </div>
                 <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-accent" />
                    <span>Born on: <strong>{player.dateBorn || 'N/A'}</strong></span>
                </div>
                {player.strDescriptionEN && (
                    <p className="text-sm text-muted-foreground pt-2 italic line-clamp-3">
                        {player.strDescriptionEN}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default function SportRandomizer() {
  const [team, setTeam] = useState<Team | null>(null);
  const [player, setPlayer] = useState<FootballerResult | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamRateLimit, triggerTeamRateLimit] = useRateLimiter(3000);
  const [playerRateLimit, triggerPlayerRateLimit] = useRateLimiter(3000);
  const { user } = useAuth();

  const handleRandomizeTeam = async () => {
    sendGTMEvent({
      event: 'action_sport_randomizer_team',
      user_email: user?.email ?? 'guest',
    });
    if (isLoadingTeam || teamRateLimit) return;
    triggerTeamRateLimit();
    setIsLoadingTeam(true);
    setError(null);
    setTeam(null);
    setPlayer(null);

    try {
      const newTeam = await getRandomTeam();
      setTeam(newTeam);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while finding a team.');
      console.error(err);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const handleRandomizePlayer = async () => {
    if (!team || isLoadingPlayer || playerRateLimit) return;
     sendGTMEvent({
      event: 'action_sport_randomizer_player',
      user_email: user?.email ?? 'guest',
    });
    triggerPlayerRateLimit();
    setIsLoadingPlayer(true);
    setError(null);
    setPlayer(null);

    try {
        const newPlayer = await getRandomPlayerFromTeam(team.idTeam, team.strTeam, team.strTeamBadge, team.strLeague);
        setPlayer(newPlayer);
    } catch (err: any) {
         setError(err.message || 'An unexpected error occurred while finding a player.');
        console.error(err);
    } finally {
        setIsLoadingPlayer(false);
    }
  }

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Football Randomizer</CardTitle>
        <CardDescription>
          First, randomize a team, then find a random player from that squad. <i>Powered by TheSportsDB.com</i>
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        {isLoadingTeam && (
            <div className="w-full max-w-md mx-auto space-y-4 p-6">
                 <Skeleton className="h-24 w-24 rounded-full mx-auto"/>
                 <Skeleton className="h-8 w-3/4 mx-auto" />
                 <Skeleton className="h-6 w-1/4 mx-auto" />
            </div>
        )}
        {!isLoadingTeam && team && <TeamCard team={team} />}
        
        {team && !isLoadingTeam && (
          <>
            <Separator className="my-4"/>
             <Button onClick={handleRandomizePlayer} disabled={isLoadingPlayer || playerRateLimit}>
                <Users className="mr-2 h-4 w-4" />
                {isLoadingPlayer ? 'Finding Player...' : playerRateLimit ? 'Please wait...' : 'Randomize Player from this Team'}
            </Button>
          </>
        )}

        {isLoadingPlayer && (
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

        {!isLoadingPlayer && player && <PlayerCard player={player} />}

        {!team && !isLoadingTeam && !error && (
          <p className="text-muted-foreground">
            Click the button to get a random football team.
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
          onClick={handleRandomizeTeam}
          disabled={isLoadingTeam || teamRateLimit}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoadingTeam
            ? 'Finding a Team...'
            : teamRateLimit
            ? 'Please wait...'
            : 'Randomize Team'}
        </Button>
      </CardFooter>
    </Card>
  );
}
