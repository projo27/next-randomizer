import { z } from 'zod';

const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const RandomWalkInputSchema = z.object({
  startLocation: LatLngSchema.describe('The starting coordinates (latitude and longitude).'),
  distanceKm: z.number().min(0.5).max(50).describe('The desired walking distance in kilometers.'),
  isLoop: z.boolean().describe('Whether the route should be a loop, returning to the start.'),
});
export type RandomWalkInput = z.infer<typeof RandomWalkInputSchema>;

export const RandomWalkOutputSchema = z.object({
  path: z.array(LatLngSchema).describe('An array of coordinates representing the walking path.'),
  actualDistanceMeters: z.number().describe('The actual calculated distance of the route in meters.'),
  bounds: z.object({
    northeast: LatLngSchema,
    southwest: LatLngSchema,
  }).describe('The bounding box for the generated route.'),
  startPoint: LatLngSchema.describe('The starting point of the route.'),
  turnPoint: LatLngSchema.describe('The farthest point or turn-around point of the route.'),
});
export type RandomWalkOutput = z.infer<typeof RandomWalkOutputSchema>;
