
'use server';
/**
 * @fileOverview A flow for recommending a travel destination.
 *
 * - recommendCity - A function that suggests the best city to visit from a list within a given country.
 * - CityRecommenderInput - The input type for the recommendCity function.
 * - CityRecommenderOutput - The return type for the recommendCity function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CityRecommenderInputSchema = z.object({
  country: z.string().describe('The country where the cities are located.'),
  cities: z.array(z.string()).describe('A list of cities to choose from.'),
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
    unsplashPhotoId: z.string().describe('An ID of a real, high-quality, relevant photo from Unsplash. For example, for Paris, a valid ID would be "62u_kTTmJ0o".'),
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
From the list of cities provided in {{country}}, pick the random single best city for a tourist to visit.
The city you choose, must not same as city you choose last to three has choosen before

Cities to choose from: {{cities}}

Provide a short, one-paragraph description explaining why it's a fantastic travel destination, highlighting its main attractions or what makes it unique.

Also, provide an ID for a stunning, realistic photo of the city you recommended from Unsplash. It should be just the ID, not the full URL.
For example, for a photo of Paris, a valid ID would be "62u_kTTmJ0o".`,
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
    
    // Construct the full, working URL from the photo ID
    const imageUrl = `https://images.unsplash.com/photo-${output.unsplashPhotoId}?q=80&w=1080&auto=format&fit=crop`;

    return {
      city: output.city,
      description: output.description,
      imageUrl: imageUrl,
    };
  }
);
