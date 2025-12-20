
'use server';

import { STREETVIEW_LOCATIONS } from '@/lib/streetview-locations-server';
import { USER_AGENT } from '@/lib/utils';
import * as cheerio from 'cheerio';


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
 * Fetches a truly random geographical coordinate by scraping randomcoords.com.
 * @returns {Promise<LatLng>} A promise that resolves to an object with lat and lng.
 */
export async function getTrulyRandomPlace(): Promise<LatLng> {
  try {
    const response = await fetch('https://randomcoords.com/', {
      headers: {
        'User-Agent': USER_AGENT
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch from randomcoords.com: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find the coordinates text and split it
    // const coordsText = $('#random_point dd').first().text();
    const coordsText = $('body > div > div > div:nth-child(3) > div > div:nth-child(1) > div.flex.flex-col.justify-center.text-lg').first().text();
    const [latStr, lngStr] = coordsText.split(',');

    // console.info(coordsText, latStr, lngStr);

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinate format received from website.');
    }

    return { lat, lng };
  } catch (error) {
    console.error("Error fetching truly random place:", error);
    // Fallback to the curated list if the external API fails
    return getRandomPlace();
  }
}
