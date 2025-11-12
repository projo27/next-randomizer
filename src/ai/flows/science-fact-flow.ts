'use server';
/**
 * @fileOverview A flow for generating a random science fact with sources.
 *
 * - generateScienceFact - A function that returns a fact, a source URL, and a YouTube URL.
 * - ScienceFactOutput - The return type for the generateScienceFact function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScienceFactOutputSchema = z.object({
  fact: z.string().describe('A single, interesting, and verifiable science fact that is not commonly known.'),
  sourceUrl: z.string().url().describe('A URL to a credible article (from a university, scientific journal, or reputable science news site) that verifies the fact.'),
  youtubeUrl: z.string().url().optional().describe('An optional URL to a relevant and high-quality YouTube video that explains or visualizes the fact.'),
});
export type ScienceFactOutput = z.infer<typeof ScienceFactOutputSchema>;


export async function generateScienceFact(): Promise<ScienceFactOutput> {
  return scienceFactFlow();
}

const scienceFactPrompt = ai.definePrompt({
  name: 'scienceFactPrompt',
  output: {
    schema: ScienceFactOutputSchema,
  },
  prompt: `You are an expert science communicator. Your task is to provide a single, fascinating, and little-known science fact.

Instructions:
1. Generate one surprising and verifiable science fact from any field (e.g., physics, biology, astronomy, chemistry).
2. Find a URL for a credible, authoritative source article that supports this fact. The source must be from a reputable institution like a university, a peer-reviewed journal (e.g., Nature, Science), or a well-respected science news organization (e.g., NASA, National Geographic, Scientific American). Avoid blogs or low-quality content farms.
3. Find a URL for a high-quality, relevant YouTube video that explains or visualizes the fact in an engaging way. The video should be from a reputable channel. This is optional; if a good video cannot be found, you can omit it.
4. Ensure the fact is concise and easy to understand for a general audience.
5. All output must be in English.

Example:
{
  "fact": "A teaspoonful of a neutron star would weigh about 6 billion tons, which is roughly the weight of the entire human population.",
  "sourceUrl": "https://www.nasa.gov/mission_pages/chandra/news/neutron-stars.html",
  "youtubeUrl": "https://www.youtube.com/watch?v=hCwR1A9G3-Y"
}

Generate a new, random science fact now.`,
});

const scienceFactFlow = ai.defineFlow(
  {
    name: 'scienceFactFlow',
    outputSchema: ScienceFactOutputSchema,
  },
  async () => {
    const { output } = await scienceFactPrompt();
    return output!;
  }
);
