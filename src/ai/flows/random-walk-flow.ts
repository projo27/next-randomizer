'use server';

/**
 * @fileOverview A flow for generating a random walking route.
 * - generateRandomWalk - A function that creates a random walking path based on a start point and desired distance.
 */

import { RandomWalkInputSchema, RandomWalkOutputSchema, RandomWalkInput, RandomWalkOutput } from './random-walk-types';

interface LatLng {
  lat: number;
  lng: number;
}

async function getDirections(origin: LatLng, destination: LatLng): Promise<any> {
  // Use the server-specific key first, fallback to public key (though public key often has referer restrictions)
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API Key is not configured.");
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=walking&key=${apiKey}`;

  console.log(url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Directions API request failed: ${response.statusText}`);
  }
  const data = await response.json();
  if (data.status !== 'OK') {
    if (data.status === 'ZERO_RESULTS') return null;
    throw new Error(`Directions API error: ${data.status} - ${data.error_message || 'No details'}`);
  }
  return data;
}

function decodePolyline(encoded: string): LatLng[] {
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  const path: LatLng[] = [];

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    path.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return path;
}

export async function generateRandomWalk(input: RandomWalkInput): Promise<RandomWalkOutput> {
  const { startLocation, distanceKm, isLoop } = RandomWalkInputSchema.parse(input);
  const targetDistanceMeters = distanceKm * 1000;

  for (let i = 0; i < 2; i++) { // Try up to 3 times to find a suitable route
    // Generate a random destination point.
    // The straight-line distance is adjusted to be less than the walking distance.
    const angle = Math.random() * 2 * Math.PI;
    const distanceMultiplier = isLoop ? 0.35 : 0.7; // Shorter leg for loops
    const distanceDegrees = (targetDistanceMeters * distanceMultiplier) / 111320; // Approx meters to degrees

    const destLat = startLocation.lat + distanceDegrees * Math.cos(angle);
    const destLng = startLocation.lng + distanceDegrees * Math.sin(angle) / Math.cos(startLocation.lat * Math.PI / 180);

    const destination = { lat: destLat, lng: destLng };

    try {
      const toDestResult = await getDirections(startLocation, destination);

      if (toDestResult && toDestResult.routes.length > 0) {
        let path = decodePolyline(toDestResult.routes[0].overview_polyline.points);
        let totalDistance = toDestResult.routes[0].legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0);
        let bounds = toDestResult.routes[0].bounds;

        if (isLoop) {
          const fromDestResult = await getDirections(destination, startLocation);
          if (fromDestResult && fromDestResult.routes.length > 0) {
            const returnPath = decodePolyline(fromDestResult.routes[0].overview_polyline.points);
            path = [...path, ...returnPath];
            totalDistance += fromDestResult.routes[0].legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0);

            // Combine bounds
            bounds.northeast.lat = Math.max(bounds.northeast.lat, fromDestResult.routes[0].bounds.northeast.lat);
            bounds.northeast.lng = Math.max(bounds.northeast.lng, fromDestResult.routes[0].bounds.northeast.lng);
            bounds.southwest.lat = Math.min(bounds.southwest.lat, fromDestResult.routes[0].bounds.southwest.lat);
            bounds.southwest.lng = Math.min(bounds.southwest.lng, fromDestResult.routes[0].bounds.southwest.lng);
          }
        }

        // Check if the found route is within a reasonable range of the target distance
        if (totalDistance > targetDistanceMeters * 0.7 && totalDistance < targetDistanceMeters * 1.5) {
          return {
            path,
            actualDistanceMeters: totalDistance,
            bounds,
          };
        }
      }
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed:`, err);
      // Continue to next attempt
    }
  }

  throw new Error('Could not find a suitable walking route after several attempts. Try a different location or distance.');
}
