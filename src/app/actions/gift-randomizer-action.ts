'use server';

import { GIFTS_LIST } from '@/lib/gift-data';

export type Gift = (typeof GIFTS_LIST)[0];

export async function getRandomGift(
  recipient: string,
  occasion: string,
): Promise<Gift | null> {
  let filteredGifts = GIFTS_LIST;

  if (recipient !== 'all') {
    filteredGifts = filteredGifts.filter((gift) => gift.for === recipient);
  }

  if (occasion !== 'all') {
    filteredGifts = filteredGifts.filter((gift) => gift.tags.includes(occasion));
  }

  if (filteredGifts.length === 0) {
    // If no gifts match, broaden the search to just recipient
    if (recipient !== 'all') {
       filteredGifts = GIFTS_LIST.filter((gift) => gift.for === recipient);
    }
    // If still no gifts, return null
    if (filteredGifts.length === 0) {
        return null;
    }
  }

  const randomIndex = Math.floor(Math.random() * filteredGifts.length);
  return filteredGifts[randomIndex];
}
