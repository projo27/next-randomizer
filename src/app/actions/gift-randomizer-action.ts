'use server';

import { GIFTS_LIST } from '@/lib/gift-data';
import { supabase } from '@/lib/supabase-client';
import { searchPhotos } from '@/services/unsplash';

export type Gift = (typeof GIFTS_LIST)[0];

export type GiftResult = Gift & {
    imageUrl: string;
    amazonSearchUrl: string;
};

async function getImageUrl(itemName: string): Promise<string> {
    const photoUrls = await searchPhotos(itemName);
    if (photoUrls && photoUrls.length > 0) {
        // Return a random photo from the results for variety
        return photoUrls[Math.floor(Math.random() * photoUrls.length)];
    }
    // Fallback to a generic placeholder if no image is found
    const seed = Math.floor(Math.random() * 1000) + 1;
    return `https://picsum.photos/seed/${seed}/600/400`;
}

export async function getRandomGiftFromSupabase(
  recipient: string,
  occasion: string,
): Promise<GiftResult | null> {
  let query = supabase.from('gift_list').select('*');

  if (recipient !== 'all') {
    query = query.eq('for', recipient);
  }

  if (occasion !== 'all') {
    // Assuming 'tags' is a text array column in your Supabase 'gift_list' table
    query = query.contains('tags', [occasion]);
  }

  let { data: filteredGifts, error } = await query;

  if (error) {
    console.error('Error fetching gifts from Supabase:', error);
    return null;
  }

  if (!filteredGifts || filteredGifts.length === 0) {
    // If no gifts match, broaden the search to just recipient
    if (recipient !== 'all') {
      const { data: recipientGifts, error: recipientError } = await supabase
        .from('gift_list')
        .select('*')
        .eq('for', recipient);

      if (recipientError) {
        console.error('Error fetching recipient gifts from Supabase:', recipientError);
        return null;
      }
      filteredGifts = recipientGifts;
    } else {
      // If recipient was 'all' and no gifts found with occasion filter, try without any filters
      const { data: allGifts, error: allError } = await supabase
        .from('gift_list')
        .select('*');
      if (allError) {
        console.error('Error fetching all gifts from Supabase:', allError);
        return null;
      }
      filteredGifts = allGifts;
    }
  }

  if (!filteredGifts || filteredGifts.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * filteredGifts.length);
  const selectedGift = filteredGifts[randomIndex] as Gift; // Cast to Gift type for consistency

  const imageUrl = await getImageUrl(selectedGift.item);
  const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(selectedGift.item.replaceAll(" ", "+"))}&ref=randomizerfun-20`;

  return {
    ...selectedGift,
    imageUrl: imageUrl,
    amazonSearchUrl: amazonSearchUrl,
  };
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
  console.log(selectedGift.item, selectedGift.item.replace(" ", "+"));

  const imageUrl = await getImageUrl(selectedGift.item);
  const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(selectedGift.item.replaceAll(" ", "+"))}&ref=randomizerfun-20`;


  return {
      ...selectedGift,
      imageUrl: imageUrl,
      amazonSearchUrl: amazonSearchUrl
  };
}
