'use server';

import { PLANT_DATA, Plant } from '@/lib/plant-data';
import { searchPhotos } from '@/services/unsplash';

export type PlantResult = Plant & {
  imageUrl: string;
};

/**
 * Gets a random plant from the local data and finds a suitable image for it.
 * @returns A promise that resolves to a PlantResult object.
 */
export async function getRandomPlant(): Promise<PlantResult> {
  if (PLANT_DATA.length === 0) {
    throw new Error('No plant data is available.');
  }

  // 1. Select a random plant from our curated list
  const randomIndex = Math.floor(Math.random() * PLANT_DATA.length);
  const selectedPlant = PLANT_DATA[randomIndex];

  // 2. Search for a photo of the plant using the Unsplash service
  const photoUrls = await searchPhotos(selectedPlant.imageSearchTerm);
  
  let imageUrl = `https://picsum.photos/seed/${randomIndex}/800/600`; // Fallback
  if (photoUrls && photoUrls.length > 0) {
    // Pick a random photo from the results for variety
    imageUrl = photoUrls[Math.floor(Math.random() * photoUrls.length)];
  }

  // 3. Return the combined result
  return {
    ...selectedPlant,
    imageUrl: imageUrl,
  };
}
