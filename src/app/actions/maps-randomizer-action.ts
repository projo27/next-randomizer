'use server';

import { STREETVIEW_LOCATIONS } from '@/lib/streetview-locations-server';

export type LatLng = {
  lat: number;
  lng: number;
};

/**
 * Selects a random, curated place that is known to have good Street View imagery.
 * @returns {Promise<LatLng>} A promise that resolves to an object with lat and lng.
 */
export async function getRandomPlace(): Promise<LatLng> {
  // Select a random location from our curated list
  const randomIndex = Math.floor(Math.random() * STREETVIEW_LOCATIONS.length);
  const randomLocation = STREETVIEW_LOCATIONS[randomIndex];
  
  return {
    lat: randomLocation.lat,
    lng: randomLocation.lng,
  };
}
