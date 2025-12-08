
'use server';
import { z } from 'zod';
import { searchPhotos } from './unsplash';

const TREFLE_API_URL = 'https://trefle.io/api/v1';
const TREFLE_LAST_PAGE = 21863;

const PlantSchema = z.object({
  id: z.number(),
  common_name: z.string().nullable(),
  scientific_name: z.string(),
  year: z.number().nullable(),
  genus: z.string(),
  family: z.string(),
  family_common_name: z.string().nullable(),
  image_url: z.string().url().nullable(),
  bibliography: z.string().nullable(),
  author: z.string().nullable(),
});

const PlantListSchema = z.object({
  data: z.array(PlantSchema),
  links: z.object({
    self: z.string(),
    first: z.string(),
    next: z.string().optional(),
    last: z.string(),
  }),
});

export type TreflePlant = z.infer<typeof PlantSchema>;

async function fetchFromTrefle<T>(
  endpoint: string,
  schema: z.ZodType<T>,
): Promise<T | null> {
  const apiKey = process.env.TREFLE_API_KEY;
  if (!apiKey) {
    throw new Error('Trefle API Key is not configured. Please set TREFLE_API_KEY in your environment variables.');
  }

  const url = `${TREFLE_API_URL}/${endpoint}`;
  try {
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}token=${apiKey}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Trefle API Error:', response.status, await response.text());
      throw new Error(`Failed to fetch data from Trefle. Status: ${response.status}`);
    }

    const data = await response.json();
    // console.log(url, data);
    const validation = schema.safeParse(data);
    if (!validation.success) {
      console.error('Trefle API Zod validation error:', validation.error.issues);
      throw new Error('Received unexpected data format from Trefle API.');
    }

    return validation.data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    if (error instanceof Error) throw error;
    throw new Error('An unknown error occurred while fetching from Trefle API.');
  }
}

/**
 * Fetches a list of random plants. Since Trefle doesn't have a "random" endpoint,
 * we get a random page from a large set of results.
 * @returns A promise that resolves to a single random TreflePlant object or null.
 */
export async function getRandomPlantFromTrefle(): Promise<TreflePlant | null> {
  // Max page number for common plants is ~6800. Let's use a safe lower number.
  const randomPage = Math.floor(Math.random() * TREFLE_LAST_PAGE) + 1;
  const plantListResponse = await fetchFromTrefle(`plants?page=${randomPage}`, PlantListSchema);
  // console.log(plantListResponse);

  if (!plantListResponse || plantListResponse.data.length === 0) {
    return null;
  }

  // Pick a random plant from the page
  const randomPlant = plantListResponse.data[Math.floor(Math.random() * plantListResponse.data.length)];

  // If the plant from Trefle doesn't have an image, try to fetch one from Unsplash
  if (!randomPlant.image_url) {
      const searchTerm = randomPlant.common_name || randomPlant.scientific_name;
      const photos = await searchPhotos(searchTerm);
      if (photos.length > 0) {
          randomPlant.image_url = photos[Math.floor(Math.random() * photos.length)];
      }
  }

  return randomPlant;
}
