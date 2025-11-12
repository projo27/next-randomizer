'use server';

import { ACTIVITIES } from '@/lib/activity-data';

export type Activity = (typeof ACTIVITIES)[0];

/**
 * Gets a random activity based on a specified difficulty level.
 * @param level The difficulty level (1-5).
 * @returns A promise that resolves to an Activity object or null if none is found.
 */
export async function getRandomActivity(level: number): Promise<Activity | null> {
  if (level < 1 || level > 5) {
    throw new Error('Activity level must be between 1 and 5.');
  }

  const filteredActivities = ACTIVITIES.filter((activity) => activity.level === level);

  if (filteredActivities.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * filteredActivities.length);
  return filteredActivities[randomIndex];
}
