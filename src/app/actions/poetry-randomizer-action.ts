'use server';

import { z } from 'zod';

const PoetryDbResponseSchema = z.array(
  z.object({
    title: z.string(),
    author: z.string(),
    lines: z.array(z.string()),
    linecount: z.string(),
  })
).min(1);

export type PoetryResult = z.infer<typeof PoetryDbResponseSchema>[0];

/**
 * Fetches a random poem from the PoetryDB API.
 * @returns A promise that resolves to a PoetryResult object or null if an error occurs.
 */
export async function getRandomPoem(): Promise<PoetryResult | null> {
  const url = 'https://poetrydb.org/random';

  try {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`PoetryDB API error: ${response.statusText}`);
    }

    const data = await response.json();
    const validation = PoetryDbResponseSchema.safeParse(data);

    if (!validation.success) {
      console.error('PoetryDB Zod validation error:', validation.error);
      throw new Error('Received unexpected data format from PoetryDB API.');
    }

    // The API returns an array with a single poem object
    return validation.data[0];

  } catch (error) {
    console.error('Error fetching random poem:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred while fetching a poem.');
  }
}
