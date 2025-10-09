'use server';

type Participant = {
  id: string;
  name: string;
  level: number;
};

type Team = {
  members: Participant[];
  totalLevel: number;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function shuffleTeams(participants: Participant[], teamSize: number, useLevels: boolean): Promise<Team[]> {
    if (participants.length < teamSize) {
      throw new Error("Not enough participants to form a single team.");
    }
    
    const numTeams = Math.floor(participants.length / teamSize);
    if (numTeams === 0) {
      throw new Error("Not enough participants to form a single team.");
    }
    
    const newTeams: Team[] = Array.from({ length: numTeams }, () => ({ members: [], totalLevel: 0 }));

    if (useLevels) {
      const sortedParticipants = [...participants].sort((a, b) => b.level - a.level);
      sortedParticipants.forEach((participant) => {
        newTeams.sort((a, b) => a.totalLevel - b.totalLevel);
        const teamToJoin = newTeams.find(team => team.members.length < teamSize);
        if (teamToJoin) {
          teamToJoin.members.push(participant);
          teamToJoin.totalLevel += participant.level;
        }
      });
    } else {
      const shuffledParticipants = shuffleArray(participants);
      for (let i = 0; i < numTeams * teamSize; i++) {
        const teamIndex = i % numTeams;
        newTeams[teamIndex].members.push(shuffledParticipants[i]);
        newTeams[teamIndex].totalLevel += shuffledParticipants[i].level;
      }
    }
    
    return newTeams;
}
