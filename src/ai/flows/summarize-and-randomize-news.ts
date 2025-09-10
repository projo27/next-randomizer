'use server';

/**
 * @fileOverview A flow for summarizing and randomizing news content from given URLs.
 *
 * - summarizeAndRandomizeNews - A function that accepts news article URLs and a category, then summarizes and randomizes the content.
 * - SummarizeAndRandomizeNewsInput - The input type for the summarizeAndRandomizeNews function.
 * - SummarizeAndRandomizeNewsOutput - The return type for the summarizeAndRandomizeNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAndRandomizeNewsInputSchema = z.object({
  urls: z
    .array(z.string().url())
    .describe('An array of URLs pointing to news articles.'),
  category: z.string().describe('The category of the news articles.'),
});
export type SummarizeAndRandomizeNewsInput = z.infer<
  typeof SummarizeAndRandomizeNewsInputSchema
>;

const SummarizeAndRandomizeNewsOutputSchema = z.object({
  randomizedSummary: z
    .string()
    .describe('A summarized and randomized version of the news content.'),
});
export type SummarizeAndRandomizeNewsOutput = z.infer<
  typeof SummarizeAndRandomizeNewsOutputSchema
>;

export async function summarizeAndRandomizeNews(
  input: SummarizeAndRandomizeNewsInput
): Promise<SummarizeAndRandomizeNewsOutput> {
  return summarizeAndRandomizeNewsFlow(input);
}

const summarizeAndRandomizeNewsPrompt = ai.definePrompt({
  name: 'summarizeAndRandomizeNewsPrompt',
  input: {
    schema: SummarizeAndRandomizeNewsInputSchema,
  },
  output: {
    schema: SummarizeAndRandomizeNewsOutputSchema,
  },
  prompt: `You are a news aggregator that summarizes and randomizes news content from multiple sources.

You will receive a list of URLs and a category. Your task is to extract the content from these URLs, summarize the combined content based on the provided category, and then present the information in a randomized manner to offer a fresh perspective.

URLs: {{urls}}
Category: {{category}}

Provide a randomized summary of the news content.`,
});

const summarizeAndRandomizeNewsFlow = ai.defineFlow(
  {
    name: 'summarizeAndRandomizeNewsFlow',
    inputSchema: SummarizeAndRandomizeNewsInputSchema,
    outputSchema: SummarizeAndRandomizeNewsOutputSchema,
  },
  async input => {
    const {output} = await summarizeAndRandomizeNewsPrompt(input);
    return output!;
  }
);
