'use server';

export type LatLng = {
  lat: number;
  lng: number;
};

// Function to generate a random float between min and max
function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// A simple (and not exhaustive) list of major landmass bounding boxes
// to increase the chances of hitting land.
const landmasses = [
  { name: 'Eurasia', minLat: 25, maxLat: 70, minLng: -10, maxLng: 140 },
  { name: 'Africa', minLat: -35, maxLat: 37, minLng: -18, maxLng: 51 },
  { name: 'North America', minLat: 15, maxLat: 70, minLng: -168, maxLng: -52 },
  { name: 'South America', minLat: -56, maxLat: 12, minLng: -81, maxLng: -34 },
  { name: 'Australia', minLat: -44, maxLat: -10, minLng: 113, maxLng: 154 },
];

/**
 * Generates a random latitude and longitude, with a higher probability of being on land.
 * @returns {Promise<LatLng>} A promise that resolves to an object with lat and lng.
 */
export async function getRandomPlace(): Promise<LatLng> {
  // 85% chance to pick a point within a major landmass bounding box
  if (Math.random() < 0.95) {
    const landmass = landmasses[Math.floor(Math.random() * landmasses.length)];
    const lat = getRandomFloat(landmass.minLat, landmass.maxLat);
    const lng = getRandomFloat(landmass.minLng, landmass.maxLng);
    return { lat, lng };
  } else {
    // 5% chance for a completely random point for more variety (could be ocean)
    const lat = getRandomFloat(-60, 75); // Avoid extreme poles
    const lng = getRandomFloat(-180, 180);
    return { lat, lng };
  }
}
