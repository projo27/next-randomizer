'use server';

/**
 * @fileOverview A flow for generating a random walking route.
 * - generateRandomWalk - A function that creates a random walking path based on a start point and desired distance.
 */

import { Client, TravelMode } from "@googlemaps/google-maps-services-js";
import { RandomWalkInputSchema, RandomWalkInput, RandomWalkOutput } from './random-walk-types';

// Initialize the Google Maps Client
const client = new Client({});

interface LatLng {
  lat: number;
  lng: number;
}

// Utility to decode polyline if needed, or we can use the library's utility if we import it.
// However, to keep it simple and dependency-free for this util, we can keep the existing function 
// or import { decodePath } from "@googlemaps/google-maps-services-js/dist/util";
// Let's use the manual one to ensure we get exactly the array format we expect {lat, lng}
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

async function getDirections(origin: LatLng, destination: LatLng) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API Key is not configured.");
  }

  // Debug log (masked)
  console.log(`Using API Key: ${apiKey.substring(0, 5)}... with Referer: ${process.env.NEXT_PUBLIC_APP_URL}`);

  try {
    const response = await client.directions({
      params: {
        origin: [origin.lat, origin.lng],
        destination: [destination.lat, destination.lng],
        mode: TravelMode.walking,
        key: apiKey,
      },
      timeout: 5000, // 5 seconds timeout
      headers: {
        "Referer": process.env.NEXT_PUBLIC_APP_URL || "https://randomizer.fun",
        "User-Agent": "NextRandomizer/1.0",
      },
    });

    if (response.data.status !== 'OK') {
      if (response.data.status === 'ZERO_RESULTS') return null;
      throw new Error(`Directions API error: ${response.data.status} - ${response.data.error_message || 'No details'}`);
    }

    return response.data;
  } catch (error: any) {
    // Better error logging
    if (error.response) {
      console.error("API Error Response:", error.response.data);
      throw new Error(`Google Directions API request failed: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Google Directions API request failed: ${error.message}`);
  }
}

export async function generateRandomWalk(input: RandomWalkInput): Promise<RandomWalkOutput> {
  const { startLocation, distanceKm, isLoop } = RandomWalkInputSchema.parse(input);
  const targetDistanceMeters = distanceKm * 1000;

  for (let i = 0; i < 1; i++) { // Try up to 3 times
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
            // Note: The library returns bounds as {northeast: {lat, lng}, southwest: {lat, lng}}
            // which matches our interface, but we need to ensure types match.
            // The API response bounds values are numbers.
            bounds.northeast.lat = Math.max(bounds.northeast.lat, fromDestResult.routes[0].bounds.northeast.lat);
            bounds.northeast.lng = Math.max(bounds.northeast.lng, fromDestResult.routes[0].bounds.northeast.lng);
            bounds.southwest.lat = Math.min(bounds.southwest.lat, fromDestResult.routes[0].bounds.southwest.lat);
            bounds.southwest.lng = Math.min(bounds.southwest.lng, fromDestResult.routes[0].bounds.southwest.lng);
          }
        }

        // Check if the found route is within a reasonable range of the target distance
        const minDistance = targetDistanceMeters * 0.5; // Relaxed lower bound
        const maxDistance = targetDistanceMeters * 1.5;

        if (totalDistance > minDistance && totalDistance < maxDistance) {
          return {
            path,
            actualDistanceMeters: totalDistance,
            bounds: {
              northeast: { lat: bounds.northeast.lat, lng: bounds.northeast.lng },
              southwest: { lat: bounds.southwest.lat, lng: bounds.southwest.lng }
            },
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
