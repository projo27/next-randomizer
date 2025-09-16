'use server';
/**
 * @fileOverview A server action for recommending a random YouTube video.
 */

import { searchVideos } from '@/services/youtube';
import { z } from 'zod';
import { COUNTRY_CODES } from '@/lib/country-codes';

const VideoRecommenderInputSchema = z.object({
  videoCategoryId: z.string().optional().describe('The YouTube video category ID.'),
  regionCode: z.string().optional().describe('The ISO 3166-1 alpha-2 country code (e.g., US, ID, GB).'),
});
type VideoRecommenderInput = z.infer<typeof VideoRecommenderInputSchema>;

const VideoRecommenderOutputSchema = z.object({
  videoId: z.string().describe('The ID of the recommended YouTube video.'),
});
type VideoRecommenderOutput = z.infer<typeof VideoRecommenderOutputSchema>;


export async function recommendVideo(input: VideoRecommenderInput): Promise<VideoRecommenderOutput> {
    // Validate input
    const validatedInput = VideoRecommenderInputSchema.safeParse(input);
    if (!validatedInput.success) {
        throw new Error("Invalid input for video recommender.");
    }
    
    const { regionCode, videoCategoryId } = validatedInput.data;
    
    // Find the language code corresponding to the region code
    const country = COUNTRY_CODES.find(c => c.code === regionCode);
    const relevanceLanguage = country?.lang;
  
    // Search for popular videos in the given category
    const videoIds = await searchVideos(videoCategoryId, regionCode, relevanceLanguage);

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
