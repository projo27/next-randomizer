
"use client";

import { useState, useEffect, useRef } from "react";
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
import { Wand2, Star, Copy, Check, Trash2, PlusCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { useRateLimiter } from "@/hooks/use-rate-limiter";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { shuffleTeams } from "@/app/actions/team-shuffler-action";
import { useSettings } from "@/context/SettingsContext";

type Participant = {
  id: string;
  name: string;
  level: number;
};

type Team = {
  members: Participant[];
  totalLevel: number;
};

function StarRating({ level, setLevel, readOnly = false }: { level: number, setLevel?: (level: number) => void, readOnly?: boolean }) {
  return (
    <div className={cn("flex items-center", !readOnly && "cursor-pointer")}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < level ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          onClick={() => !readOnly && setLevel && setLevel(i + 1)}
        />
      ))}
    </div>
  );
}

const initialParticipants: Participant[] = [
  { id: '1', name: "John Doe", level: 3 },
  { id: '2', name: "Jane Doe", level: 2 },
  { id: '3', name: "John Smith", level: 4 },
  { id: '4', name: "Richard Roe", level: 1 },
  { id: '5', name: "John Q. Public", level: 5 },
  { id: '6', name: "A. Person", level: 2 },
];

export default function TeamShuffler() {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [participantsText, setParticipantsText] = useState("");

  const [teamSize, setTeamSize] = useState("3");
  const [teams, setTeams] = useState<Team[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResultCopied, setIsResultCopied] = useState(false);
  const [useLevels, setUseLevels] = useState(true);
  const [inputMode, setInputMode] = useState<'panel' | 'textarea'>('panel');
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/musics/randomize-synth.mp3");

    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isShuffling) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isShuffling]);

  useEffect(() => {
    if (inputMode === 'textarea') {
      const text = participants.map(p => `${p.name} ${p.level}`).join('\n');
      setParticipantsText(text);
    }
  }, [inputMode, participants]);


  const handleInputModeChange = (checked: boolean) => {
    const newMode = checked ? 'textarea' : 'panel';
    setInputMode(newMode);

    if (newMode === 'panel') {
      parseParticipantsFromText(participantsText);
    }
  };

  const handleUseLevelsChange = (checked: boolean) => {
    setUseLevels(checked);
    if (!checked) {
      setParticipants(prev => prev.map(p => ({ ...p, level: 1 })));
    }
  };

  const parseParticipantsFromText = (text: string) => {
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line);
    const newParticipants: Participant[] = [];
    let parseError = null;

    for (const [index, line] of lines.entries()) {
      let name: string;
      let level: number;
      if (useLevels) {
        const parts = line.split(" ");
        const levelPart = parseInt(parts[parts.length - 1], 10);
        name = parts.slice(0, parts.length - 1).join(" ");
        if (!name || isNaN(levelPart) || levelPart < 1 || levelPart > 5) {
          parseError = `Invalid line: "${line}". Format: "Name Level" (1-5).`;
          level = 1; 
        } else {
          level = levelPart;
        }
      } else {
        name = line;
        level = 1;
      }
      newParticipants.push({ id: `${Date.now()}-${index}`, name, level });
    }
    setParticipants(newParticipants);
    setError(parseError);
    return !parseError;
  };

  const handleShuffle = async () => {
    if (isShuffling || isRateLimited) return;
    triggerRateLimit();
    setError(null);
    setTeams([]);
    setIsResultCopied(false);
    
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
    }
    
    let currentParticipants = [...participants];
    if (inputMode === 'textarea') {
      const success = parseParticipantsFromText(participantsText);
      if (!success) {
        setIsShuffling(false);
        return;
      }
      const lines = participantsText.split("\n").map((line) => line.trim()).filter((line) => line);
      currentParticipants = lines.map((line, index) => {
          let name: string;
          let level: number;
          if (useLevels) {
            const parts = line.split(" ");
            level = parseInt(parts[parts.length - 1], 10);
            name = parts.slice(0, parts.length - 1).join(" ");
            if (isNaN(level)) level = 1;
          } else {
            name = line;
            level = 1;
          }
          return { id: `${Date.now()}-${index}`, name, level };
      });
    }

    const size = parseInt(teamSize, 10);
    if (isNaN(size) || size < 2) {
      setError("Team size must be at least 2.");
      return;
    }
    
    setIsShuffling(true);

    try {
        const newTeams = await shuffleTeams(currentParticipants, size, useLevels);
        setTimeout(() => {
            setTeams(newTeams);
            setIsShuffling(false);
        }, animationDuration * 1000);
    } catch(e: any) {
        setError(e.message);
        setIsShuffling(false);
    }
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
    toast({ title: "Copied!", description: "Team results copied to clipboard." });
    setTimeout(() => setIsResultCopied(false), 2000);
  };
  
  const handleAddParticipant = () => {
      setParticipants([...participants, {id: `${Date.now()}`, name: "", level: 1}]);
  }

  const handleRemoveParticipant = (id: string) => {
      setParticipants(participants.filter(p => p.id !== id));
  }

  const handleParticipantChange = (id: string, field: 'name' | 'level', value: string | number) => {
      setParticipants(participants.map(p => p.id === id ? {...p, [field]: value} : p));
  }

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Team Shuffler</CardTitle>
        <CardDescription>
          {useLevels ? "Create balanced teams based on player skill level." : "Randomly shuffle participants into teams."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div className="flex items-center space-x-2">
                <Switch id="use-levels" checked={useLevels} onCheckedChange={handleUseLevelsChange} />
                <Label htmlFor="use-levels">Use Skill Level Balancing</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Switch id="input-mode" checked={inputMode === 'textarea'} onCheckedChange={handleInputModeChange} />
                <Label htmlFor="input-mode">Use Text Area Input</Label>
            </div>
        </div>

        <div className="grid w-full items-center gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="participants">Participants</Label>
            <span className="text-xs text-muted-foreground">
              {inputMode === 'panel' ? participants.length : participantsText.split('\n').filter(Boolean).length} participant(s)
            </span>
          </div>

          {inputMode === 'textarea' ? (
              <Textarea
                id="participants-text"
                placeholder={useLevels ? "e.g., John Doe 3" : "e.g., John Doe"}
                rows={8}
                value={participantsText}
                onChange={(e) => setParticipantsText(e.target.value)}
                className="resize-none mt-1"
                disabled={isShuffling}
              />
          ) : (
            <div className="space-y-2 mt-1 p-4 border rounded-md max-h-96 overflow-y-auto">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                    <Input 
                        placeholder="Participant Name"
                        value={p.name}
                        onChange={(e) => handleParticipantChange(p.id, 'name', e.target.value)}
                        className="flex-grow"
                        disabled={isShuffling}
                    />
                    {useLevels && (
                       <StarRating 
                            level={p.level}
                            setLevel={(level) => handleParticipantChange(p.id, 'level', level)}
                            readOnly={isShuffling}
                        />
                    )}
                     <Button variant="ghost" size="icon" onClick={() => handleRemoveParticipant(p.id)} disabled={isShuffling}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddParticipant} disabled={isShuffling} className="mt-2 w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Participant
              </Button>
            </div>
          )}
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
                    {[...Array(Math.floor(participants.length / parseInt(teamSize, 10)) || 1)].map((_, i) => (
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
                          {useLevels && <StarRating level={member.level} readOnly />}
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
