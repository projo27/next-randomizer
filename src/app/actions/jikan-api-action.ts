'use server';

import { z } from 'zod';

const API_BASE_URL = 'https://api.jikan.moe/v4';

// --- Zod Schemas for API validation ---

const ImageSchema = z.object({
  jpg: z.object({
    image_url: z.string().url(),
  }),
});

const BaseEntrySchema = z.object({
  mal_id: z.number(),
  url: z.string().url(),
  images: ImageSchema,
  title: z.string(),
  score: z.number().nullable(),
  synopsis: z.string().nullable(),
  genres: z.array(z.object({ name: z.string() })),
});

const AnimeResponseSchema = z.object({
  data: BaseEntrySchema.extend({
    episodes: z.number().nullable(),
    status: z.string(),
  }),
});

const MangaResponseSchema = z.object({
  data: BaseEntrySchema.extend({
    chapters: z.number().nullable(),
    volumes: z.number().nullable(),
    status: z.string(),
  }),
});

const CharacterResponseSchema = z.object({
  data: z.object({
    mal_id: z.number(),
    url: z.string().url(),
    images: ImageSchema,
    name: z.string(),
    about: z.string().nullable(),
    anime: z.array(z.object({ anime: z.object({ title: z.string() }) })).optional(),
    manga: z.array(z.object({ manga: z.object({ title: z.string() }) })).optional(),
  }),
});

export type JikanResult =
  | z.infer<typeof AnimeResponseSchema>['data']
  | z.infer<typeof MangaResponseSchema>['data']
  | z.infer<typeof CharacterResponseSchema>['data'];

export type JikanRequestType = 'anime' | 'manga' | 'characters';

async function fetchFromApi<T>(endpoint: string, schema: z.ZodType<T>): Promise<T | null> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    // Jikan API has rate limits, so no-store is important.
    const response = await fetch(url, { cache: 'no-store' });
    
    // Jikan API sometimes returns 429 Too Many Requests. It's better to fail gracefully.
    if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please wait a moment before trying again.');
    }
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const validation = schema.safeParse(data);

    if (!validation.success) {
      console.error('Jikan API Zod validation error:', validation.error.issues);
      // It's possible to get an empty data object from random, so retry logic is better.
      return null;
    }
    
    return validation.data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    if (error instanceof Error) throw error;
    throw new Error('An unknown error occurred while fetching from the Jikan API.');
  }
}

/**
 * Gets a random entry (anime, manga, or character) from the Jikan API.
 * Retries up to 3 times if the API returns an empty result.
 * @param type The type of entry to fetch.
 * @returns A promise that resolves to a JikanResult object or null if not found.
 */
export async function getRandomJikanEntry(type: JikanRequestType): Promise<JikanResult | null> {
    for (let i = 0; i < 3; i++) {
        let result: any = null;
        switch (type) {
            case 'anime':
                result = await fetchFromApi('/random/anime', AnimeResponseSchema);
                break;
            case 'manga':
                result = await fetchFromApi('/random/manga', MangaResponseSchema);
                break;
            case 'characters':
                result = await fetchFromApi('/random/characters', CharacterResponseSchema);
                break;
        }

        if (result && result.data) {
             // For characters, try to find the main series title
            if (type === 'characters') {
                const animeTitle = result.data.anime?.[0]?.anime?.title;
                const mangaTitle = result.data.manga?.[0]?.manga?.title;
                result.data.seriesTitle = animeTitle || mangaTitle || 'N/A';
            }
            return result.data;
        }
        
        // Wait a bit before retrying if the result was null
        if(i < 2) await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    throw new Error(`Could not find a random ${type} after multiple attempts. Please try again.`);
}