'use server';

import { GIFTS_LIST } from '@/lib/gift-data';
import { searchPhotos } from '@/services/unsplash';

export type Gift = (typeof GIFTS_LIST)[0];

export type GiftResult = Gift & {
    imageUrl: string;
};

async function getImageHint(itemName: string): Promise<string> {
    const photoUrls = await searchPhotos(itemName);
    if (photoUrls && photoUrls.length > 0) {
        // Return a random photo from the results for variety
        return photoUrls[Math.floor(Math.random() * photoUrls.length)];
    }
    // Fallback to a generic placeholder if no image is found
    const seed = Math.floor(Math.random() * 1000) + 1;
    return `https://picsum.photos/seed/${seed}/600/400`;
}


export async function getRandomGift(
  recipient: string,
  occasion: string,
): Promise<GiftResult | null> {
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
  const selectedGift = filteredGifts[randomIndex];

  const imageUrl = await getImageHint(selectedGift.item);

  return {
      ...selectedGift,
      imageUrl: imageUrl,
  };
}
