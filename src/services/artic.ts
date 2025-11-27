'use server';

import { z } from 'zod';

const API_BASE_URL = 'https://api.artic.edu/api/v1';

// Predefined search terms to get variety
const SEARCH_TERMS = ['landscape', 'portrait', 'cat', 'dog', 'impressionism', 'abstract', 'sculpture', 'armor', 'modern', 'japanese art'];

const ArtworkSchema = z.object({
  id: z.number(),
  title: z.string(),
  image_ids: z.array(z.string()).min(1),
  artist_display: z.string().optional().nullable(),
  date_display: z.string().optional().nullable(),
  artwork_type_title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image_config: z.object({
      iiif_url: z.string().url()
  })
});
export type ArticArtwork = z.infer<typeof ArtworkSchema>;

const SearchResultSchema = z.object({
  data: z.array(ArtworkSchema),
  config: z.object({
      iiif_url: z.string().url(),
  })
});

async function fetchRandomArtworkFromAPI(): Promise<ArticArtwork | null> {
    const randomTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    const randomPage = Math.floor(Math.random() * 5) + 1; // Get from first 5 pages for relevance

    const fields = [
        'id', 'title', 'image_ids', 'artist_display', 
        'date_display', 'artwork_type_title', 'description'
    ].join(',');
    
    // We query for artworks that have images and are in the public domain
    const queryUrl = `${API_BASE_URL}/artworks/search?q=${randomTerm}&page=${randomPage}&fields=${fields}&query[term][is_public_domain]=true&query[exists][field]=image_ids`;

    try {
        const response = await fetch(queryUrl, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Art Institute API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        const parsedData = SearchResultSchema.safeParse(data);
        
        if (!parsedData.success || parsedData.data.length === 0) {
            console.warn(`No valid artworks found for term "${randomTerm}" on page ${randomPage}. Retrying...`);
            return null; // Let the caller handle retry
        }

        const artworksWithImages = parsedData.data.filter(art => art.image_ids && art.image_ids.length > 0);

        if(artworksWithImages.length === 0) {
             console.warn(`No artworks with images found for term "${randomTerm}" on page ${randomPage}. Retrying...`);
             return null;
        }

        // Pick a random artwork from the results
        const randomArtwork = artworksWithImages[Math.floor(Math.random() * artworksWithImages.length)];
        
        // Add the general image config to the specific artwork object for easier use in the frontend
        return {
            ...randomArtwork,
            image_config: parsedData.data.config,
        };

    } catch (error) {
        console.error("Error fetching from Art Institute API:", error);
        throw error;
    }
}


/**
 * Gets a random public domain artwork from the Art Institute of Chicago.
 * Retries up to 3 times if no artwork is found.
 */
export async function getRandomArtwork(): Promise<ArticArtwork | null> {
    for (let i = 0; i < 3; i++) {
        const artwork = await fetchRandomArtworkFromAPI();
        if (artwork) {
            return artwork;
        }
    }
    throw new Error('Failed to fetch a random artwork after multiple attempts. Please try again later.');
}
