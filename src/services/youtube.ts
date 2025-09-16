/**
 * @fileOverview A service for interacting with the YouTube Data API.
 */
import 'server-only';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

/**
 * Searches for popular videos on YouTube based on a category ID.
 * @param videoCategoryId The ID of the video category.
 * @param regionCode The ISO 3166-1 alpha-2 country code.
 * @returns A promise that resolves to an array of video IDs.
 */
export async function searchVideos(videoCategoryId?: string, regionCode?: string): Promise<string[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API Key is not configured. Please set YOUTUBE_API_KEY environment variable.');
  }

  try {
    const params: any = {
      key: apiKey,
      part: ['id'],
      chart: 'mostPopular',
      maxResults: 50,
      videoEmbeddable: 'true',
      type: ['video'],
    };

    if (regionCode) {
      params.regionCode = regionCode;
    }
    if (videoCategoryId) {
      params.videoCategoryId = videoCategoryId;
    }

    const response = await youtube.videos.list(params);

    const videoIds = response.data.items?.map(item => item.id).filter((id): id is string => !!id);

    return videoIds || [];

  } catch (error) {
    console.error('Error calling YouTube API:', error);
    // It's possible the error is a GoogleApisError, which has more details
    const apiError = error as any;
    if (apiError.errors && apiError.errors.length > 0) {
      console.error('YouTube API Error Details:', apiError.errors);
      const reason = apiError.errors[0].reason;
      if (reason === 'keyInvalid' || reason === 'ipRefererBlocked' || reason === 'accessNotConfigured' || reason === 'forbidden') {
        throw new Error(`The YouTube API key is invalid or misconfigured. Reason: ${reason}`);
      }
      // Handle cases where a category might not be available for a region
      if (reason === 'processingFailure' || apiError.code === 400) {
        console.warn(`Could not fetch chart for category ${videoCategoryId} in region ${regionCode}. It might not be available.`);
        return []; // Return empty array to allow frontend to handle it gracefully
      }
    }
    throw new Error('An unexpected error occurred while fetching videos from YouTube.');
  }
}
