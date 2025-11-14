'use server';

import { getEventsForDay } from '@/services/wikipedia';
import type { WikipediaEvent } from '@/services/wikipedia';

export type HistoricalEvent = WikipediaEvent;

/**
 * Gets a random historical event that occurred on the current day and month from Wikipedia.
 * @returns A promise that resolves to a HistoricalEvent object or null if none found.
 */
export async function getTodaysHistoricalEvent(): Promise<HistoricalEvent | null> {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  try {
    const events = await getEventsForDay(month, day);

    if (events.length === 0) {
      // This is unlikely with Wikipedia API, but good to have a fallback.
      return null;
    }
    
    // Pick a random event from the fetched list
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];

  } catch (error) {
    console.error("Error fetching historical event:", error);
    // Re-throw the error so the client can handle it
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while fetching the historical event.");
  }
}
