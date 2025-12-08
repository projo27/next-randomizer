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

/**
 * Fetches a truly random geographical coordinate from the randomcoords.com API.
 * @returns {Promise<LatLng>} A promise that resolves to an object with lat and lng.
 */
export async function getTrulyRandomPlace(): Promise<LatLng> {
  try {
    const response = await fetch('https://www.randomcoords.com/json');
    if (!response.ok) {
      throw new Error(`Failed to fetch from randomcoords.com: ${response.statusText}`);
    }
    const data = await response.json();

    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinate format received from API.');
    }

    return { lat, lng };
  } catch (error) {
    console.error("Error fetching truly random place:", error);
    // Fallback to the curated list if the external API fails
    return getRandomPlace();
  }
}
