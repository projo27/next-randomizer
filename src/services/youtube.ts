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
 * @param relevanceLanguage The ISO 639-1 two-letter language code.
 * @returns A promise that resolves to an array of video IDs.
 */
export async function searchVideos(videoCategoryId?: string, regionCode?: string, relevanceLanguage?: string): Promise<string[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API Key is not configured. Please set YOUTUBE_API_KEY environment variable.');
  }

  try {
    const params: any = {
      key: apiKey,
      part: ['id'],
      type: ['video'],
      maxResults: 50,
      videoEmbeddable: 'true',
      q: ' ', // General query for broad results
      videoCategoryId: videoCategoryId,
      videoDuration: 'long',
    };

    if (regionCode) {
      params.regionCode = regionCode;
    }
    else delete params.regionCode;

    if (relevanceLanguage) {
      params.relevanceLanguage = relevanceLanguage;
    }
    else delete params.relevanceLanguage;

    console.log("YouTube API Params:", params);

    // Use search.list which is more flexible for this kind of query.
    const response = await youtube.search.list(params);

    const videoIds = response.data.items?.map(item => item.id?.videoId).filter((id): id is string => !!id);

    console.log(videoIds);

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
      if (reason === 'processingFailure' || apiError.code === 400) {
        console.warn(`Could not fetch videos for category ${videoCategoryId} in region ${regionCode}.`);
        return []; // Return empty array to allow frontend to handle it gracefully
      }
    }
    throw new Error('An unexpected error occurred while fetching videos from YouTube.');
  }
}
