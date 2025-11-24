'use server';

import { getRandomWWFAnimal } from '@/services/wwf-scraper';
import type { WWFAnimal } from '@/services/wwf-scraper';

export type AnimalResult = WWFAnimal;

/**
 * Gets a random animal by scraping the World Wildlife Fund website.
 * @returns A promise that resolves to an AnimalResult object or null if an error occurs.
 */
export async function getRandomAnimal(): Promise<AnimalResult | null> {
  try {
    const animal = await getRandomWWFAnimal();
    return animal;
  } catch (error) {
    console.error("Error in getRandomAnimal action:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while fetching animal data.");
  }
}
