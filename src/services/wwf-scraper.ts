'use server';

import * as cheerio from 'cheerio';
import { z } from 'zod';

const BASE_URL = 'https://www.worldwildlife.org';
const MAX_SPECIES_PAGE = 5; // As observed from the website's pagination

const WWFAnimalSchema = z.object({
  name: z.string(),
  imageUrl: z.string().url(),
  scientificName: z.string(),
  status: z.string(),
  description: z.string(),
  sourceUrl: z.string().url(),
});

export type WWFAnimal = z.infer<typeof WWFAnimalSchema>;

async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching HTML from ${url}:`, error);
    throw error;
  }
}

export async function getRandomWWFAnimal(): Promise<WWFAnimal | null> {
  try {
    // 1. Get a random list page
    const randomPage = Math.floor(Math.random() * MAX_SPECIES_PAGE) + 1;
    const listPageUrl = `${BASE_URL}/species?page=${randomPage}`;
    const listHtml = await fetchHtml(listPageUrl);
    const $list = cheerio.load(listHtml);

    // 2. Find all animal links on the page
    const animalLinks: string[] = [];
    $list('a.item.species-item').each((_, element) => {
      const href = $list(element).attr('href');
      if (href) {
        animalLinks.push(href);
      }
    });

    if (animalLinks.length === 0) {
      throw new Error('Could not find any animal links on the species page. The website structure may have changed.');
    }

    // 3. Pick a random animal link and fetch its page
    const randomAnimalPath = animalLinks[Math.floor(Math.random() * animalLinks.length)];
    const animalUrl = `${BASE_URL}${randomAnimalPath}`;
    const animalHtml = await fetchHtml(animalUrl);
    const $animal = cheerio.load(animalHtml);

    // 4. Scrape the details from the animal's page
    const name = $animal('h1.hero-title').text().trim();
    const scientificName = $animal('p.sub-copy.scientific-name').text().trim();
    
    // The image URL is often in a meta tag or a specific img tag
    let imageUrl = $animal('meta[property="og:image"]').attr('content') || 
                   $animal('.hero-img img').attr('src') ||
                   '';

    if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = BASE_URL + imageUrl;
    }

    const status = $animal('.species-ancillary-item .species-ancillary-label:contains("Status")').next('.species-ancillary-value').text().trim();
    
    // Find the description, trying a few different selectors as website structures can vary
    let description = $animal('div.wysiwyg.copy p').first().text().trim();
    if (!description) {
        description = $animal('div.container p').first().text().trim();
    }


    if (!name || !imageUrl || !scientificName) {
        throw new Error(`Failed to scrape essential details from ${animalUrl}. The page structure might be different than expected.`);
    }

    // 5. Validate the scraped data
    const validation = WWFAnimalSchema.safeParse({
      name,
      imageUrl,
      scientificName,
      status: status || 'Not specified',
      description: description || 'No description available.',
      sourceUrl: animalUrl,
    });

    if (!validation.success) {
      console.error("Scraped data validation failed:", validation.error.issues);
      throw new Error("The scraped data did not match the expected format.");
    }

    return validation.data;

  } catch (error) {
    console.error("Error during scraping process:", error);
    // Re-throw to be handled by the action
    throw error;
  }
}
