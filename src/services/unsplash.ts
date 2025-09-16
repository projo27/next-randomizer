
/**
 * @fileOverview A service for interacting with the Unsplash API.
 */
import "server-only";

const UNSPLASH_API_URL = "https://api.unsplash.com";

interface UnsplashPhoto {
  urls: {
    regular: string;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
}

/**
 * Searches for photos on Unsplash.
 * @param query The search query (e.g., city name).
 * @returns A promise that resolves to an array of photo URLs.
 */
export async function searchPhotos(query: string): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("Unsplash Access Key is not configured. Please set UNSPLASH_ACCESS_KEY environment variable.");
  }

  const searchUrl = new URL(`${UNSPLASH_API_URL}/search/photos`);
  searchUrl.searchParams.append("query", query);
  searchUrl.searchParams.append("per_page", "10"); // Get 10 results to have some variety
  searchUrl.searchParams.append("orientation", "landscape");

  try {
    const response = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      console.error("Unsplash API Error:", await response.text());
      throw new Error(`Failed to fetch photos from Unsplash. Status: ${response.status}`);
    }

    const data: UnsplashSearchResponse = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map(photo => photo.urls.regular);
  } catch (error) {
    console.error("Error calling Unsplash API:", error);
    throw new Error("An unexpected error occurred while fetching photos.");
  }
}
