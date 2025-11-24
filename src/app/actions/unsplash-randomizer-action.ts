'use server';

import { z } from 'zod';

const UnsplashPhotoSchema = z.object({
  id: z.string(),
  urls: z.object({
    regular: z.string().url(),
    full: z.string().url(),
  }),
  links: z.object({
    download_location: z.string().url(),
  }),
  user: z.object({
    name: z.string(),
    links: z.object({
      html: z.string().url(),
    }),
  }),
  description: z.string().nullable(),
  alt_description: z.string().nullable(),
});

export type UnsplashResult = {
  imageUrl: string;
  downloadUrl: string;
  photographerName: string;
  photographerUrl: string;
  alt: string;
};

const accessKey = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Fetches a random photo from Unsplash.
 * @param query The search query for the photo. Defaults to 'wallpaper'.
 * @returns A promise that resolves to an UnsplashResult object.
 */
export async function getRandomUnsplashImage(query: string): Promise<UnsplashResult> {
  if (!accessKey) {
    throw new Error('Unsplash Access Key is not configured on the server.');
  }

  const searchQuery = query.trim() === '' ? 'wallpaper' : query;
  const apiUrl = new URL('https://api.unsplash.com/photos/random');
  apiUrl.searchParams.append('query', searchQuery);
  apiUrl.searchParams.append('orientation', 'landscape');
  apiUrl.searchParams.append('content_filter', 'high');

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Unsplash API Error:', errorData);
      throw new Error(`Failed to fetch image from Unsplash. Status: ${response.statusText}`);
    }

    const data = await response.json();
    const parsedData = UnsplashPhotoSchema.safeParse(data);

    if (!parsedData.success) {
      console.error('Unsplash Zod validation error:', parsedData.error);
      throw new Error('Received unexpected data format from Unsplash.');
    }

    const { urls, user, links, alt_description, description } = parsedData.data;

    // The download_location needs a separate API call to trigger the download count for the photographer
    const downloadTriggerResponse = await fetch(links.download_location, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });
    
    if (!downloadTriggerResponse.ok) {
        // If trigger fails, fall back to a direct link. It's better than no download.
        console.warn("Failed to trigger Unsplash download location, falling back to direct URL.");
        return {
          imageUrl: urls.regular,
          downloadUrl: urls.full, // Fallback to full URL
          photographerName: user.name,
          photographerUrl: user.links.html,
          alt: alt_description || description || `A random image about ${searchQuery}`,
        };
    }

    const downloadData = await downloadTriggerResponse.json();

    return {
      imageUrl: urls.regular,
      downloadUrl: downloadData.url,
      photographerName: user.name,
      photographerUrl: user.links.html,
      alt: alt_description || description || `A random image about ${searchQuery}`,
    };

  } catch (error) {
    console.error('Error in getRandomUnsplashImage:', error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown error occurred while fetching the image.');
  }
}
