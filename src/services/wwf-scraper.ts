import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { z } from 'zod';

const BASE_URL = 'https://www.worldwildlife.org';
const MAX_SPECIES_PAGE = 5; // As observed from the website's pagination

const WWFAnimalSchema = z.object({
  name: z.string(),
  imageUrl: z.string().url(),
  scientificName: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  sourceUrl: z.string().url(),
});

export type WWFAnimal = z.infer<typeof WWFAnimalSchema>;

async function fetchHtml(url: string): Promise<string> {
  const browser = await chromium.launch({
      headless: true, // Set to false if you need to debug visually
  });
  
  try {
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    
    // Go to the URL and wait for the network to be idle to ensure dynamic content loads
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Get the full HTML content
    const content = await page.content();
    return content;
  } catch (error) {
    console.error(`Error fetching HTML from ${url} with Playwright:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}

export async function getRandomWWFAnimal(): Promise<WWFAnimal | null> {
  try {
    // 1. Get a random list page
    const randomPage = Math.floor(Math.random() * MAX_SPECIES_PAGE) + 1;
    const listPageUrl = `${BASE_URL}/species/?page=${randomPage}`;
    const listHtml = await fetchHtml(listPageUrl);
    const $list = cheerio.load(listHtml);

    // 2. Find all animal links on the page
    const animalLinks: string[] = [];
    $list('#species-list ul li a').each((_, element) => {
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
    const name = $animal('h1#hero-headline').first().text().trim();
    
    // Description from data-introduction-section
    const $intro = $animal('div[data-introduction-text]');
    let description = $intro.find('p').first().text().trim();
    
    // Image from picture element
    let imageUrl = $animal('picture img').first().attr('src') || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = BASE_URL + imageUrl;
    }

    // Facts from data-at-a-glance
    const $facts = $animal('div[data-at-a-glance]');
    
    // Scientific Name: Find the label and get the next element
    // Using a more loose search for the label to be safe
    let scientificName = '';
    $facts.find('dt').each((_, el) => {
        if ($animal(el).text().trim().toLowerCase() === 'scientific name') {
            scientificName = $animal(el).next().text().trim();
            console.info("ketemu", scientificName)
        }
    });

    // Status: Find the label "Status" and try to find the active/highlighted status
    // Based on the image, it's a list. We'll try to get the text of the next element.
    // If it's a list, we might get all statuses. We'll try to clean it up.
    let status = '';
    $facts.find('dt').each((_, el) => {
        if ($animal(el).text().trim().includes('Status')) {
            // The status values are likely in the next sibling container
            const $statusContainer = $animal(el).next();
            // Try to find an element that indicates active state, or just take the text
            // Common patterns for active state: class="active", style="...", etc.
            // If we can't find a specific active class, we'll take the whole text for now.
            status = $statusContainer.text().trim();
        }
    });

    // console.log("name ", name, "scientificName ", scientificName, "status ", status, "description ", description, "imageUrl ", imageUrl); 

    if (!name || !imageUrl) {
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
