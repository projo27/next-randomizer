
'use server';
/**
 * @fileOverview A flow for recommending a travel destination.
 *
 * - recommendCity - A function that suggests the best city to visit from a list within a given country.
 * - CityRecommenderInput - The input type for the recommendCity function.
 * - CityRecommenderOutput - The return type for the recommendCity function.
 */

import { ai } from '@/ai/genkit';
import { searchPhotos } from '@/services/unsplash';
import { z } from 'genkit';

const CityRecommenderInputSchema = z.object({
  country: z.string().describe('The country where the cities are located.'),
  // cities: z.array(z.string()).describe('A list of cities to choose from.'),
});
export type CityRecommenderInput = z.infer<typeof CityRecommenderInputSchema>;

const CityRecommenderOutputSchema = z.object({
  city: z.string().describe('The recommended city to visit.'),
  description: z.string().describe('A short, compelling reason why this city is the best choice for a traveler.'),
  imageUrl: z.string().url().describe('A URL to a beautiful, high-quality, realistic photograph of the recommended city.'),
});
export type CityRecommenderOutput = z.infer<typeof CityRecommenderOutputSchema>;

const CityRecommenderAIOutputSchema = z.object({
    city: z.string().describe('The recommended city to visit.'),
    description: z.string().describe('A short, compelling reason why this city is the best choice for a traveler.'),
});

export async function recommendCity(input: CityRecommenderInput): Promise<CityRecommenderOutput> {
  return cityRecommenderFlow(input);
}

const cityRecommenderPrompt = ai.definePrompt({
  name: 'cityRecommenderPrompt',
  input: {
    schema: CityRecommenderInputSchema,
  },
  output: {
    schema: CityRecommenderAIOutputSchema,
  },
  prompt: `You are a world-class travel expert providing recommendations.
From the list of cities provided in {{country}}, pick the single random best city for a tourist to visit from the country.
The city result must be difference from before result

Provide a short, two-paragraph description explaining why it's a fantastic travel destination, highlighting its main attractions or what makes it unique.`,
});

const cityRecommenderFlow = ai.defineFlow(
  {
    name: 'cityRecommenderFlow',
    inputSchema: CityRecommenderInputSchema,
    outputSchema: CityRecommenderOutputSchema,
  },
  async (input) => {
    const { output } = await cityRecommenderPrompt(input);
    if (!output) {
      throw new Error("Failed to get a recommendation from the AI.");
    }
    
    // Search for photos of the recommended city using the Unsplash service
    const photoUrls = await searchPhotos(output.city);
    if (!photoUrls || photoUrls.length === 0) {
      throw new Error(`Could not find photos for ${output.city}`);
    }
    
    // Pick a random photo from the results
    const imageUrl = photoUrls[Math.floor(Math.random() * photoUrls.length)];

    return {
      city: output.city,
      description: output.description,
      imageUrl: imageUrl,
    };
  }
);
