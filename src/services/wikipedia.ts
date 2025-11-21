'use server';

import * as cheerio from 'cheerio';
import { z } from 'zod';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1/feed/onthisday/events';

// Define the structure of a single event link
const EventLinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});

// Define the structure of a single event
const WikipediaEventSchema = z.object({
  year: z.string(),
  description: z.string(),
  links: z.array(EventLinkSchema),
});

export type WikipediaEvent = z.infer<typeof WikipediaEventSchema>;

/**
 * Fetches historical events for a specific day and month from Wikipedia's "On this day" API.
 * @param month The month (1-12).
 * @param day The day (1-31).
 * @returns A promise that resolves to an array of WikipediaEvent objects.
 */
export async function getEventsForDay(month: number, day: number): Promise<WikipediaEvent[]> {
  const url = `${WIKIPEDIA_API_URL}/${month}/${day}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Randomizer.fun/1.0.0 (support@randomizer.fun; https://randomizer.fun)',
        'Accept': 'application/json; charset=utf-8'
      },
      cache: 'no-store' // The data changes daily, so we shouldn't cache it for long.
    });

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.events || !Array.isArray(data.events)) {
      throw new Error("Invalid data format received from Wikipedia API.");
    }
    
    // Parse and validate each event
    const parsedEvents = data.events.map((event: any): WikipediaEvent | null => {
      if (!event.text || !event.year || !event.pages) {
        return null;
      }
      
      const links = event.pages.map((page: any): z.infer<typeof EventLinkSchema> => ({
          title: page.titles.normalized,
          url: page.content_urls.desktop.page
      }));

      // Zod validation for each parsed event
      const validation = WikipediaEventSchema.safeParse({
        year: event.year.toString(),
        description: event.text,
        links: links,
      });

      if (validation.success) {
        return validation.data;
      } else {
        console.warn("Skipping an invalid event from Wikipedia:", validation.error);
        return null;
      }
    }).filter((event: any): event is WikipediaEvent => event !== null);
    
    return parsedEvents;

  } catch (error) {
    console.error(`Error fetching or parsing Wikipedia data for ${month}/${day}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
}
