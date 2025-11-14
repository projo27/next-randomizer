'use server';

import { HISTORICAL_EVENTS } from '@/lib/historical-events';
import type { HistoricalEvent } from '@/lib/historical-events';

/**
 * Gets a random historical event that occurred on the current day and month.
 * If no event is found for today, it returns a random event from any day.
 * @returns A promise that resolves to a HistoricalEvent object.
 */
export async function getTodaysHistoricalEvent(): Promise<HistoricalEvent> {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
  const currentDay = today.getDate();

  // Filter events that happened on the same month and day
  const eventsForToday = HISTORICAL_EVENTS.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getMonth() + 1 === currentMonth &&
      eventDate.getDate() === currentDay
    );
  });

  if (eventsForToday.length > 0) {
    // If there are events for today, pick a random one
    const randomIndex = Math.floor(Math.random() * eventsForToday.length);
    return eventsForToday[randomIndex];
  } else {
    // If no event for today, pick a random event from the entire list
    const randomIndex = Math.floor(Math.random() * HISTORICAL_EVENTS.length);
    return HISTORICAL_EVENTS[randomIndex];
  }
}
