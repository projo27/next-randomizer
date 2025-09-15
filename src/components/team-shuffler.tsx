"use client";

import { useState } from "react";
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
import { Wand2, Star, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";

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
          className={`h-4 w-4 ${
            i < level ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function TeamShuffler() {
  const [participantsText, setParticipantsText] = useState(`Paijo 3
Paimin 2
Painah 4
Paimo 1
Paijan 5
Paidi 2`);
  const [teamSize, setTeamSize] = useState("3");
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parseParticipants = (): Participant[] | null => {
    const lines = participantsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const participants: Participant[] = [];
    for (const line of lines) {
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
    }
    return participants;
  };

  const handleShuffle = () => {
    setError(null);
    setTeams([]);

    const participants = parseParticipants();
    if (!participants) return;

    const size = parseInt(teamSize, 10);
    if (isNaN(size) || size < 2) {
      setError("Team size must be at least 2.");
      return;
    }
    
    if (participants.length < size) {
        setError("Not enough participants to form a single team.");
        return;
    }

    // Sort participants by level in descending order
    participants.sort((a, b) => b.level - a.level);

    const numTeams = Math.floor(participants.length / size);
    if(numTeams === 0) {
        setError("Not enough participants to form a single team.");
        return;
    }
    const newTeams: Team[] = Array.from({ length: numTeams }, () => ({
      members: [],
      totalLevel: 0,
    }));

    // Distribute players using a greedy algorithm
    participants.forEach((participant) => {
        // Find the team with the lowest total level that is not yet full
        let bestTeam: Team | null = null;
        let lowestLevel = Infinity;

        for (const team of newTeams) {
            if (team.members.length < size && team.totalLevel < lowestLevel) {
                lowestLevel = team.totalLevel;
                bestTeam = team;
            }
        }
        
        // If all teams are full, this logic might fail for remaining players
        if(bestTeam) {
            bestTeam.members.push(participant);
            bestTeam.totalLevel += participant.level;
        }
    });

    setTeams(newTeams);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Team Shuffler</CardTitle>
        <CardDescription>
          Create balanced teams based on player skill level.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="participants">Participants (Name and Level 1-5)</Label>
          <Textarea
            id="participants"
            placeholder="Enter participants, one per line..."
            rows={8}
            value={participantsText}
            onChange={(e) => setParticipantsText(e.target.value)}
            className="resize-none"
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="team-size">Members per Team</Label>
          <Input
            id="team-size"
            type="number"
            min="2"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          onClick={handleShuffle}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Shuffle into Teams!
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {teams.length > 0 && (
          <div className="mt-6 w-full space-y-4">
            <h3 className="text-xl font-bold text-center">Generated Teams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, index) => (
                <Card key={index} className="bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Team {index + 1}</span>
                      <Badge variant="secondary">Lvl: {team.totalLevel}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {team.members.map((member) => (
                        <li key={member.name} className="flex justify-between items-center">
                          <span>{member.name}</span>
                          <StarRating level={member.level} />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
