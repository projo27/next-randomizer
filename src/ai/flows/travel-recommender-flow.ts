
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
});
export type CityRecommenderOutput = z.infer<typeof CityRecommenderOutputSchema>;

export async function recommendCity(input: CityRecommenderInput): Promise<CityRecommenderOutput> {
  return cityRecommenderFlow(input);
}

const cityRecommenderPrompt = ai.definePrompt({
  name: 'cityRecommenderPrompt',
  input: {
    schema: CityRecommenderInputSchema,
  },
  output: {
    schema: CityRecommenderOutputSchema,
  },
  prompt: `You are a world-class travel expert providing recommendations.
From the list of cities provided in {{country}}, pick the single best city for a tourist to visit.

Cities to choose from: {{cities}}

Provide a short, one-paragraph description explaining why it's a fantastic travel destination, highlighting its main attractions or what makes it unique.`,
});

const cityRecommenderFlow = ai.defineFlow(
  {
    name: 'cityRecommenderFlow',
    inputSchema: CityRecommenderInputSchema,
    outputSchema: CityRecommenderOutputSchema,
  },
  async (input) => {
    const { output } = await cityRecommenderPrompt(input);
    return output!;
  }
);
