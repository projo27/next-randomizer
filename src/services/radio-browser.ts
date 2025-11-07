'use server';

import { z } from 'zod';

const API_BASE_URL = 'https://de1.api.radio-browser.info/json';

// --- Type Definitions ---

const RadioStationSchema = z.object({
  stationuuid: z.string(),
  name: z.string(),
  url_resolved: z.string().url(),
  homepage: z.string().url().optional().or(z.literal('')),
  favicon: z.string().url().optional().or(z.literal('')),
  tags: z.string(),
  country: z.string(),
  countrycode: z.string(),
  language: z.string(),
  votes: z.number(),
});
export type RadioStation = z.infer<typeof RadioStationSchema>;

const CountrySchema = z.object({
  name: z.string(),
  iso_3166_1: z.string(),
  stationcount: z.number(),
});
export type Country = z.infer<typeof CountrySchema>;


// --- Helper Functions ---

async function fetchFromApi<T>(endpoint: string, schema: z.ZodType<T>): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Randomizer.fun/1.0.0 (support@randomizer.fun)',
      },
      cache: 'no-store', // Radio stations can change, so don't cache this on the server
    });

    if (!response.ok) {
      throw new Error(`Radio Browser API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate the response with Zod
    const validation = schema.safeParse(data);
    if (!validation.success) {
      console.error("Radio Browser API Zod validation error:", validation.error.issues);
      throw new Error("Received unexpected data format from Radio Browser API.");
    }

    return validation.data;

  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred while fetching from Radio Browser API.');
  }
}


// --- Exported Server Actions ---

/**
 * Fetches a list of all available countries from the Radio Browser API.
 * @returns A promise that resolves to an array of Country objects.
 */
export async function getCountries(): Promise<Country[]> {
  const countries = await fetchFromApi('countries?order=stationcount&reverse=true', z.array(CountrySchema));
  // Filter out countries with no stations
  return countries.filter(c => c.stationcount > 0);
}


/**
 * Fetches a single random, playable radio station, optionally filtered by country.
 * @param countryCode The ISO 3166-1 alpha-2 country code. If 'all', a random country is used.
 * @returns A promise that resolves to a single RadioStation object or null if none are found.
 */
export async function getRandomStationByCountry(countryCode: string): Promise<RadioStation | null> {
    let endpoint = 'stations/search?limit=150&order=votes&reverse=true&hidebroken=true';
    
    if (countryCode !== 'all') {
        endpoint += `&countrycode=${countryCode}`;
    }

    const stations = await fetchFromApi(endpoint, z.array(RadioStationSchema));
    
    if (stations.length === 0) {
        return null;
    }

    // Pick a random station from the fetched list
    const randomIndex = Math.floor(Math.random() * stations.length);
    return stations[randomIndex];
}
