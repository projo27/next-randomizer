'use server';

/**
 * @fileOverview A flow for generating an "Outfit of the Day" (OOTD) recommendation.
 *
 * - generateOotd - A function that suggests an outfit based on gender, style, and season.
 * - OotdGeneratorInput - The input type for the generateOotd function.
 * - OotdGeneratorOutput - The return type for the generateOotd function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OotdGeneratorInputSchema = z.object({
  gender: z.string().describe('The gender for the outfit (e.g., Pria, Wanita).'),
  style: z.string().describe('The desired fashion style (e.g., Casual, Formal, Streetwear).'),
  season: z.string().describe('The current season (e.g., Musim Hujan, Musim Kemarau).'),
});
export type OotdGeneratorInput = z.infer<typeof OotdGeneratorInputSchema>;

const OotdGeneratorOutputSchema = z.object({
  outfitDescription: z.string().describe('A creative and appealing description of the complete outfit.'),
  items: z.array(z.string()).describe('A list of individual clothing items that make up the outfit (e.g., "Kemeja flanel biru", "Celana jeans hitam", "Sepatu boots kulit").'),
});
export type OotdGeneratorOutput = z.infer<typeof OotdGeneratorOutputSchema>;

export async function generateOotd(input: OotdGeneratorInput): Promise<OotdGeneratorOutput> {
  return ootdGeneratorFlow(input);
}

const ootdPrompt = ai.definePrompt({
  name: 'ootdGeneratorPrompt',
  input: {
    schema: OotdGeneratorInputSchema,
  },
  output: {
    schema: OotdGeneratorOutputSchema,
  },
  prompt: `You are a creative and knowledgeable fashion stylist. Your task is to generate a stylish and practical "Outfit of the Day" (OOTD) based on the user's preferences.

User Preferences:
- Gender: {{gender}}
- Fashion Style: {{style}}
- Season: {{season}}

Instructions:
1.  Create a complete outfit recommendation including a top, bottom, footwear, and at least one accessory.
2.  Write a compelling and descriptive summary of the outfit in 'outfitDescription'. Make it sound fashionable and appealing.
3.  List the individual clothing and accessory items in the 'items' array. Be specific about colors and materials where appropriate.
4.  Ensure the outfit is suitable for the specified season. For example, recommend warmer, layered clothing for 'Musim Hujan' or light, breathable fabrics for 'Musim Kemarau'.
5.  All output must be in Indonesian.

Example for 'Wanita', 'Casual', 'Musim Kemarau':
{
  "outfitDescription": "Tampil santai namun tetap chic di musim kemarau dengan kombinasi klasik yang menyegarkan. Blus linen putih yang ringan dipadukan dengan celana kulot berwarna khaki memberikan siluet yang nyaman dan elegan. Sandal espadrilles dan tas anyam jerami menambahkan sentuhan musim panas yang sempurna.",
  "items": [
    "Blus linen lengan pendek berwarna putih",
    "Celana kulot katun berwarna khaki",
    "Sandal espadrilles dengan tali",
    "Tas anyam bahan jerami",
    "Kacamata hitam cat-eye"
  ]
}

Generate an OOTD now based on the user's preferences.`,
});

const ootdGeneratorFlow = ai.defineFlow(
  {
    name: 'ootdGeneratorFlow',
    inputSchema: OotdGeneratorInputSchema,
    outputSchema: OotdGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await ootdPrompt(input);
    return output!;
  }
);
