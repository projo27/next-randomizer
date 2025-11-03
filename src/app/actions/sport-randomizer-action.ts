'use server';

import { z } from 'zod';

const API_KEY = process.env.THESPORTSDB_API_KEY || '1';
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
  strPosition: z.string().nullable(),
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
  strBadge: z.string().nullable(),
  strLeague: z.string(),
});
export type Team = z.infer<typeof TeamSchema>;

export interface FootballerResult extends Player {
    strTeam: string;
    strTeamBadge: string | null;
    strLeague: string;
}

// Helper to fetch data and handle errors
async function fetchData(url: string) {
  console.log(url);
  if (!API_KEY) {
    throw new Error('TheSportsDB API Key is not configured. Please set THESPORTSDB_API_KEY in your environment variables.');
  }
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch data from TheSportsDB. Status: ${response.status}`);
  }
  const data = await response.json();
  if (data === null || data.teams === null || (data.player === null && data.teams === undefined)) {
      throw new Error("TheSportsDB returned no data. This can happen with the free API. Please try again.");
  }
  return data;
}

export async function getRandomTeam(): Promise<Team> {
    try {
        // 1. Select a random league
        const randomLeague = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
        const leagueQuery = encodeURIComponent(randomLeague);
        
        // 2. Get all teams from that league
        const teamsData = await fetchData(`${API_BASE_URL}/search_all_teams.php?l=${leagueQuery}`);
        const teamsResult = TeamSchema.pick({ idTeam: true, strTeam: true, strBadge: true }).array().safeParse(teamsData.teams);

        if (!teamsResult.success || teamsResult.data.length === 0) {
            throw new Error(`No teams found for league: ${randomLeague}`);
        }

        // 3. Select a random team
        const randomTeam = teamsResult.data[Math.floor(Math.random() * teamsResult.data.length)];
        
        return {
            ...randomTeam,
            strLeague: randomLeague
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Zod validation error in getRandomTeam:", error.issues);
            throw new Error("Received unexpected data format from TheSportsDB API for teams.");
        }
        console.error("Error in getRandomTeam:", error);
        throw error; // Re-throw the error to be handled by the client
    }
}


export async function getRandomPlayerFromTeam(teamId: string, teamName: string, teamBadge: string | null, league: string): Promise<FootballerResult> {
    try {
        // 1. Get all players from the specified team
        const playersData = await fetchData(`${API_BASE_URL}/lookup_all_players.php?id=${teamId}`);

        const playersResult = PlayerSchema.pick({ 
            idPlayer: true, 
            strPlayer: true, 
            strPosition: true, 
            strCutout: true, 
            strFanart1: true,
            strDescriptionEN: true,
            dateBorn: true,
            strNationality: true
        }).array().safeParse(playersData.player);

        if (!playersResult.success || playersResult.data.length === 0) {
             throw new Error(`No players found for team: ${teamName}. Trying again.`);
        }

        // 2. Select a random player
        const randomPlayer = playersResult.data[Math.floor(Math.random() * playersResult.data.length)];
        
        return {
            ...randomPlayer,
            strTeam: teamName,
            strTeamBadge: teamBadge,
            strLeague: league
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Zod validation error in getRandomPlayerFromTeam:", error.issues);
            throw new Error("Received unexpected data format from TheSportsDB API for players.");
        }
        console.error("Error in getRandomPlayerFromTeam:", error);
        throw error;
    }
}
