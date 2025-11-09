'use server';

import { getRandomPlantFromTrefle, TreflePlant } from '@/services/trefle';

export type PlantResult = TreflePlant;

/**
 * Gets a random plant from the Trefle API.
 * @returns A promise that resolves to a PlantResult object or null if none is found.
 */
export async function getRandomPlant(): Promise<PlantResult | null> {
  const plant = await getRandomPlantFromTrefle();
  if (!plant) {
    throw new Error('Could not retrieve a random plant from the API. Please try again.');
  }

  return plant;
}
