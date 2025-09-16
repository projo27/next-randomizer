'use server';
/**
 * @fileOverview A server action for recommending a random YouTube video.
 */

import { searchVideos } from '@/services/youtube';
import { z } from 'zod';

const VideoRecommenderInputSchema = z.object({
  category: z.string().describe('The video category to search for (e.g., "Music", "Comedy", "Gaming").'),
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
  
    // Search for popular videos in the given category
    const videoIds = await searchVideos(validatedInput.data.category);

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
