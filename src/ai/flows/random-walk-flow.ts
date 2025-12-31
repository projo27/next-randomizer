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

// Helper to calculate a destination point given distance and bearing
function getDestinationPoint(start: LatLng, distanceMeters: number, bearingDegrees: number): LatLng {
  const R = 6371e3; // Earth radius in meters
  const angDist = distanceMeters / R;
  const lat1 = start.lat * Math.PI / 180;
  const lon1 = start.lng * Math.PI / 180;
  const bearing = bearingDegrees * Math.PI / 180;

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angDist) +
    Math.cos(lat1) * Math.sin(angDist) * Math.cos(bearing));
  const lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(angDist) * Math.cos(lat1),
    Math.cos(angDist) - Math.sin(lat1) * Math.sin(lat2));

  return {
    lat: lat2 * 180 / Math.PI,
    lng: lon2 * 180 / Math.PI
  };
}

// Separate function to fetch route with waypoints
async function getRoute(origin: LatLng, destination: LatLng, waypoints: LatLng[] = []) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API Key is not configured.");

  // Debug log (masked)
  console.log(`Using API Key: ${apiKey.substring(0, 5)}... with Referer: ${process.env.NEXT_PUBLIC_APP_URL}`);

  try {
    const response = await client.directions({
      params: {
        origin: [origin.lat, origin.lng],
        destination: [destination.lat, destination.lng],
        waypoints: waypoints.map(wp => [wp.lat, wp.lng]),
        mode: TravelMode.walking,
        optimize: false, // Ensure we follow the exact order of waypoints
        key: apiKey,
      },
      timeout: 8000,
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

  for (let i = 0; i < 3; i++) { // Increase retries slightly
    try {
      let routeResult;
      let turnPoint: LatLng;

      const initialBearing = Math.random() * 360;

      if (isLoop) {
        // TRIANGULAR LOOP STRATEGY
        // User wants TOTAL distance of X km.
        // We create a triangle with 3 segments roughly X/3 length.
        const legLength = targetDistanceMeters / 3;

        // Point A
        const pointA = getDestinationPoint(startLocation, legLength, initialBearing);

        // Point B (Turn roughly 120 degrees to come back towards start but wide)
        // Add random variance to the 120 degrees (e.g., 100 to 140)
        const turnAngle = 120 + (Math.random() * 40 - 20);
        const bearingB = (initialBearing + turnAngle) % 360;
        const pointB = getDestinationPoint(pointA, legLength, bearingB);

        // Directions: Start -> A -> B -> Start
        routeResult = await getRoute(startLocation, startLocation, [pointA, pointB]);
        turnPoint = pointB; // Let's mark Point B as the "farthest" logical point in the loop sequence
      } else {
        // ROUND TRIP STRATEGY (Non-Loop but distinct return)
        // Request: "return route DIFFERENT from outbound"
        // Target: Reach destination X km away and return. Total ~2X km.
        // Strategy: Wide Diamond/Ellipse.
        // Start -> Waypoint 1 -> Destination -> Waypoint 2 -> Start

        // Destination is distanceKm away
        const destination = getDestinationPoint(startLocation, targetDistanceMeters, initialBearing);

        // Calculate a "width" for the loop so lines don't overlap.
        // Say, 20% of the distance as width offset.
        const width = targetDistanceMeters * 0.2;

        // Waypoint 1 (Outbound Offset) - 90 degrees left of bearing
        const midPoint = getDestinationPoint(startLocation, targetDistanceMeters / 2, initialBearing);
        const wp1 = getDestinationPoint(midPoint, width, (initialBearing - 90));

        // Waypoint 2 (Inbound Offset) - 90 degrees right of bearing
        const wp2 = getDestinationPoint(midPoint, width, (initialBearing + 90));

        // Directions: Start -> WP1 -> Dest -> WP2 -> Start
        // Wait, "generate random walk" usually means "Total path is distanceKm"?
        // Or "Walk TO a place distanceKm away"?
        // Current input says "distanceKm" is "The desired walking distance".
        // If user says "5km", does he mean total walk is 5km?
        // If Loop=False currently, we just walk TO there?
        // Ah, prompt says: "untuk loop route... buatkan route kembali".
        // So Loop=True means Start->...->Start.
        // Loop=False usually means Start->...->End (One way).
        // BUT user asked: "untuk yang non-loop pun juga sama, rute pulang buatkan agar berbeda".
        // This implies Loop=False ALSO returns to start?
        // If both return to start, what's the difference?
        // Usually "Loop" checkbox implies "I want to come back". "One-way" means "I go somewhere else".
        // The user request "untuk yang non-loop pun juga sama, rute pulang..." suggests they interprets "non-loop" as "Out and Back" (Round trip on same path)?
        // And they want that round trip to NOT be on the same path.
        // So effectively, BOTH are loops.
        // Difference might be shape:
        // "Loop" = Circular/Triangular constant walk.
        // "Non-Loop" treated as "Walk to a destination X km away and come back"?
        // "jaraknya berkisar kurang lebih 2 kali lipat dari jarak yang dipilih user" -> confirming this.
        // User wants Non-Loop to be "Distance = Radius". Loop to be "Distance = Total Circumference".

        // So for "Non-Loop" (Round Trip):
        // Destination is `distanceKm` away.
        // Route: Start -> Wp1 -> Dest -> Wp2 -> Start.
        routeResult = await getRoute(startLocation, startLocation, [wp1, destination, wp2]);
        turnPoint = destination;
      }

      if (routeResult && routeResult.routes.length > 0) {
        const route = routeResult.routes[0];
        const path = decodePolyline(route.overview_polyline.points);
        const totalDistance = route.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0);
        const bounds = route.bounds;

        // Validation: just ensure it's not empty. We trust logic more now.
        if (totalDistance > 100) { // Min 100m
          return {
            path,
            actualDistanceMeters: totalDistance,
            bounds: {
              northeast: { lat: bounds.northeast.lat, lng: bounds.northeast.lng },
              southwest: { lat: bounds.southwest.lat, lng: bounds.southwest.lng }
            },
            startPoint: startLocation,
            turnPoint: turnPoint,
          };
        }
      }
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed:`, err);
    }
  }

  throw new Error('Could not generate a suitable walking route. Please try a different location or distance.');
}
