'use server';

import { z } from 'zod';

const API_KEY = process.env.THESPORTSDB_API_KEY;
const API_BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// A curated list of popular football leagues
const LEAGUES = [
  'English Premier League',
  'Spanish La Liga',
  'German Bundesliga',
  'Italian Serie A',
  'French Ligue 1',
  'Dutch Eredivisie',
];

const PlayerSchema = z.object({
  idPlayer: z.string(),
  strPlayer: z.string(),
  strTeam: z.string(),
  strPosition: z.string(),
  strCutout: z.string().nullable(), // Player photo
  strFanart1: z.string().nullable(), // Background image
  strDescriptionEN: z.string().nullable(),
  dateBorn: z.string().nullable(),
  strNationality: z.string(),
});
export type Player = z.infer<typeof PlayerSchema>;

const TeamSchema = z.object({
  idTeam: z.string(),
  strTeam: z.string(),
  strTeamBadge: z.string().nullable(),
});
type Team = z.infer<typeof TeamSchema>;


export interface FootballerResult extends Player {
    strTeamBadge: string | null;
    strLeague: string;
}

// Helper to fetch data and handle errors
async function fetchData(url: string) {
  if (!API_KEY || API_KEY === '1') {
    throw new Error('TheSportsDB API Key is not configured. Please set THESPORTSDB_API_KEY in your environment variables.');
  }
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch data from TheSportsDB. Status: ${response.status}`);
  }
  const data = await response.json();
  if (data === null || data.teams === null || data.player === null) {
      throw new Error("TheSportsDB returned no data. The API might be temporarily unavailable or the league/team doesn't exist.");
  }
  return data;
}

export async function getRandomFootballer(): Promise<FootballerResult> {
    try {
        // 1. Select a random league
        const randomLeague = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
        const leagueQuery = encodeURIComponent(randomLeague);
        
        // 2. Get all teams from that league
        const teamsData = await fetchData(`${API_BASE_URL}/search_all_teams.php?l=${leagueQuery}`);
        const teams: Team[] = TeamSchema.array().parse(teamsData.teams);

        if (teams.length === 0) {
            throw new Error(`No teams found for league: ${randomLeague}`);
        }

        // 3. Select a random team
        const randomTeam = teams[Math.floor(Math.random() * teams.length)];
        const teamQuery = encodeURIComponent(randomTeam.strTeam);

        // 4. Get all players from that team
        const playersData = await fetchData(`${API_BASE_URL}/searchplayers.php?t=${teamQuery}`);
        const players: Player[] = PlayerSchema.array().parse(playersData.player);

        if (players.length === 0) {
             throw new Error(`No players found for team: ${randomTeam.strTeam}. Trying again.`);
        }

        // 5. Select a random player
        const randomPlayer = players[Math.floor(Math.random() * players.length)];
        
        return {
            ...randomPlayer,
            strTeamBadge: randomTeam.strTeamBadge,
            strLeague: randomLeague
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Zod validation error:", error.issues);
            throw new Error("Received unexpected data format from TheSportsDB API.");
        }
        console.error("Error in getRandomFootballer:", error);
        // Re-throw the error to be handled by the client
        throw error;
    }
}
