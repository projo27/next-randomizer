'use server';

import { getRandomArtwork } from '@/services/artic';
import type { ArticArtwork } from '@/services/artic';

export type ArtworkResult = ArticArtwork;

/**
 * Gets a random artwork from the Art Institute of Chicago.
 * @returns A promise that resolves to an ArtworkResult object or null if an error occurs.
 */
export async function getRandomArt(): Promise<ArtworkResult | null> {
  try {
    const artwork = await getRandomArtwork();
    return artwork;
  } catch (error) {
    console.error("Error in getRandomArt action:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while fetching artwork data.");
  }
}
