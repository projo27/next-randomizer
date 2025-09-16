'use server';
/**
 * @fileOverview A flow for recommending a random YouTube video.
 *
 * - recommendVideo - A function that suggests a video from a given category using the YouTube Data API.
 * - VideoRecommenderInput - The input type for the recommendVideo function.
 * - VideoRecommenderOutput - The return type for the recommendVideo function.
 */

import { ai } from '@/ai/genkit';
import { searchVideos } from '@/services/youtube';
import { z } from 'genkit';

const VideoRecommenderInputSchema = z.object({
  category: z.string().describe('The video category to search for (e.g., "Music", "Comedy", "Gaming").'),
});
export type VideoRecommenderInput = z.infer<typeof VideoRecommenderInputSchema>;

const VideoRecommenderOutputSchema = z.object({
  videoId: z.string().describe('The ID of the recommended YouTube video.'),
});
export type VideoRecommenderOutput = z.infer<typeof VideoRecommenderOutputSchema>;


export async function recommendVideo(input: VideoRecommenderInput): Promise<VideoRecommenderOutput> {
  return videoRecommenderFlow(input);
}

const videoRecommenderFlow = ai.defineFlow(
  {
    name: 'videoRecommenderFlow',
    inputSchema: VideoRecommenderInputSchema,
    outputSchema: VideoRecommenderOutputSchema,
  },
  async (input) => {
    // Search for popular videos in the given category
    const videoIds = await searchVideos(input.category);

    if (!videoIds || videoIds.length === 0) {
        // Return an empty string if no videos are found, the UI will handle this
        return { videoId: '' };
    }
    
    // Pick a random video from the results
    const videoId = videoIds[Math.floor(Math.random() * videoIds.length)];

    return {
      videoId: videoId,
    };
  }
);
