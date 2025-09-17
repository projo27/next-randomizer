"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Wand2, Star, Users, Copy, Check, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Skeleton } from "./ui/skeleton";

type Participant = {
  name: string;
  level: number;
};

type Team = {
  members: Participant[];
  totalLevel: number;
};

function StarRating({ level }: { level: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < level ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
        />
      ))}
    </div>
  );
}

export default function TeamShuffler() {
  const [participantsText, setParticipantsText] = useState(`John Doe 3
Jane Doe 2
John Smith 4
Richard Roe 1
John Q. Public 5
A. Person 2`);

  const [teamSize, setTeamSize] = useState("3");
  const [teams, setTeams] = useState<Team[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const [useLevels, setUseLevels] = useState(true);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);

  const participantCount = useMemo(() => {
    return participantsText.split('\n').filter(line => line.trim() !== '').length;
  }, [participantsText]);

  const handleUseLevelsChange = (checked: boolean) => {
    setUseLevels(checked);
    const lines = participantsText.split('\n').filter(line => line.trim() !== '');

    if (checked) {
      // Switching to 'With Levels'
      const newText = lines.map(line => {
        const parts = line.split(' ');
        const lastPart = parts[parts.length - 1];
        // Check if the last part is not a number between 1-5
        if (isNaN(parseInt(lastPart, 10)) || parseInt(lastPart, 10) < 1 || parseInt(lastPart, 10) > 5) {
          return `${line} 1`; // Add a default level
        }
        return line; // Line already has a valid level
      }).join('\n');
      setParticipantsText(newText);
    } else {
      // Switching to 'Without Levels'
      const newText = lines.map(line => {
        const parts = line.split(' ');
        const lastPart = parts[parts.length - 1];
        // Check if the last part is a number between 1-5
        if (!isNaN(parseInt(lastPart, 10)) && parseInt(lastPart, 10) >= 1 && parseInt(lastPart, 10) <= 5 && parts.length > 1) {
          return parts.slice(0, parts.length - 1).join(' ');
        }
        return line; // Line doesn't have a level or is just one word
      }).join('\n');
      setParticipantsText(newText);
    }
  };


  const parseParticipants = (): Participant[] | null => {
    const lines = participantsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    const participants: Participant[] = [];

    for (const line of lines) {
      if (useLevels) {
        const parts = line.split(" ");
        const level = parseInt(parts[parts.length - 1], 10);
        const name = parts.slice(0, parts.length - 1).join(" ");
        if (!name || isNaN(level) || level < 1 || level > 5) {
          setError(
            `Invalid line: "${line}". Each line must be in the format "Name Level" with level between 1 and 5.`
          );
          return null;
        }
        participants.push({ name, level });
      } else {
        if (!line) continue;
        participants.push({ name: line, level: 1 }); // Assign default level for random shuffle
      }
    }
    return participants;
  };

  // Fisher-Yates (aka Knuth) Shuffle algorithm
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }


  const handleShuffle = () => {
    triggerRateLimit();
    setError(null);
    setTeams([]);
    setIsResultCopied(false);
    setIsShuffling(true);

    const participants = parseParticipants();
    if (!participants) {
      setIsShuffling(false);
      return;
    }

    const size = parseInt(teamSize, 10);
    if (isNaN(size) || size < 2) {
      setError("Team size must be at least 2.");
      setIsShuffling(false);
      return;
    }

    if (participants.length < size) {
      setError("Not enough participants to form a single team.");
      setIsShuffling(false);
      return;
    }

    const numTeams = Math.floor(participants.length / size);
    if (numTeams === 0) {
      setError("Not enough participants to form a single team.");
      setIsShuffling(false);
      return;
    }
    
    // Fake delay for animation
    setTimeout(() => {
      const newTeams: Team[] = Array.from({ length: numTeams }, () => ({
        members: [],
        totalLevel: 0,
      }));

      if (useLevels) {
        participants.sort((a, b) => b.level - a.level);
        participants.forEach((participant) => {
          let bestTeam: Team | null = null;
          let lowestLevel = Infinity;

          for (const team of newTeams) {
            if (team.members.length < size && team.totalLevel < lowestLevel) {
              lowestLevel = team.totalLevel;
              bestTeam = team;
            } else if (team.members.length < size && !bestTeam) {
               // Fallback for teams with same total level
               bestTeam = team;
            }
          }
          if (bestTeam) {
            bestTeam.members.push(participant);
            bestTeam.totalLevel += participant.level;
          }
        });
      } else {
        const shuffledParticipants = shuffleArray(participants);
        for (let i = 0; i < numTeams * size; i++) {
          const teamIndex = i % numTeams;
          newTeams[teamIndex].members.push(shuffledParticipants[i]);
          newTeams[teamIndex].totalLevel += shuffledParticipants[i].level;
        }
      }

      setTeams(newTeams);
      setIsShuffling(false);
    }, 1000);
  };

  const handleCopyInput = () => {
    navigator.clipboard.writeText(participantsText);
    setIsInputCopied(true);
    toast({
      title: "Copied!",
      description: "Participants list copied to clipboard.",
    });
    setTimeout(() => setIsInputCopied(false), 2000);
  };

  const handleClearInput = () => {
    setParticipantsText("");
  };

  const handleCopyResult = () => {
    if (teams.length === 0) return;
    const resultString = teams.map((team, index) => {
      const header = useLevels ? `Team ${index + 1} (Total Level: ${team.totalLevel})` : `Team ${index + 1}`;
      const members = team.members.map(m => `- ${m.name}` + (useLevels ? ` (Level ${m.level})` : '')).join('\n');
      return `${header}\n${members}`;
    }).join('\n\n');

    navigator.clipboard.writeText(resultString);
    setIsResultCopied(true);
    toast({
      title: "Copied!",
      description: "Team results copied to clipboard.",
    });
    setTimeout(() => setIsResultCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Team Shuffler</CardTitle>
        <CardDescription>
          {useLevels ? "Create balanced teams based on player skill level." : "Randomly shuffle participants into teams."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="use-levels" checked={useLevels} onCheckedChange={handleUseLevelsChange} />
          <Label htmlFor="use-levels">Use Skill Level for Balancing</Label>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="participants">
              {useLevels ? "Participants (Name and Level 1-5)" : "Participants (one per line)"}
            </Label>
            <span className="text-xs text-muted-foreground">
              {participantCount} participant(s)
            </span>
          </div>
          <div className="relative">
            <Textarea
              id="participants"
              placeholder={useLevels ? "e.g., John Doe 3" : "e.g., John Doe"}
              rows={8}
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              className="resize-none pr-20 mt-1"
              disabled={isShuffling}
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <Button variant="ghost" size="icon" onClick={handleCopyInput}>
                {isInputCopied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClearInput}>
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="team-size">Members per Team</Label>
          <Input
            id="team-size"
            type="number"
            min="2"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            disabled={isShuffling}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isShuffling && (
            <div className="mt-6 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(Math.floor(participantCount / parseInt(teamSize, 10)) || 1)].map((_, i) => (
                        <div key={i} className="space-y-2 rounded-lg border p-4">
                           <Skeleton className="h-6 w-1/2" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {!isShuffling && teams.length > 0 && (
          <div className="mt-6 w-full space-y-4 border-accent border-2 shadow-lg p-4 rounded-md">
            <div className="relative text-center">
              <h3 className="text-xl font-bold">Generated Teams</h3>
              <div className="absolute -top-2 right-0">
                <Button variant="ghost" size="icon" onClick={handleCopyResult}>
                  {isResultCopied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, index) => (
                <Card key={index} className="bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Team {index + 1}</span>
                      {useLevels && <Badge variant="secondary">Lvl: {team.totalLevel}</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {team.members.map((member) => (
                        <li key={member.name} className="flex justify-between items-center">
                          <span>{member.name}</span>
                          {useLevels && <StarRating level={member.level} />}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleShuffle}
          disabled={isRateLimited || isShuffling}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isShuffling ? "Shuffling..." : isRateLimited ? "Please wait..." : "Shuffle into Teams!"}
        </Button>
      </CardFooter>
    </Card>
  );
}
