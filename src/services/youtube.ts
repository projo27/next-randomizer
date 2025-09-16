/**
 * @fileOverview A service for interacting with the YouTube Data API.
 */
import 'server-only';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

/**
 * Searches for popular videos on YouTube based on a query.
 * @param query The search query (e.g., category).
 * @returns A promise that resolves to an array of video IDs.
 */
export async function searchVideos(query: string): Promise<string[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API Key is not configured. Please set YOUTUBE_API_KEY environment variable.');
  }

  try {
    const response = await youtube.search.list({
      key: apiKey,
      part: ['id'],
      q: query,
      type: ['video'],
      videoEmbeddable: 'true',
      maxResults: 25, // Get a decent number of results for variety
      order: 'relevance',
      safeSearch: 'moderate',
    });
    
    const videoIds = response.data.items?.map(item => item.id?.videoId).filter((id): id is string => !!id);
    
    return videoIds || [];

  } catch (error) {
    console.error('Error calling YouTube API:', error);
    // It's possible the error is a GoogleApisError, which has more details
    const apiError = error as any;
    if (apiError.errors && apiError.errors.length > 0) {
        console.error('YouTube API Error Details:', apiError.errors);
        const reason = apiError.errors[0].reason;
        if (reason === 'keyInvalid' || reason === 'ipRefererBlocked' || reason === 'accessNotConfigured') {
             throw new Error(`The YouTube API key is invalid or misconfigured. Reason: ${reason}`);
        }
    }
    throw new Error('An unexpected error occurred while fetching videos from YouTube.');
  }
}
