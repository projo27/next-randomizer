// src/app/actions/tanakh-randomizer-action.ts
'use server';

import { z } from 'zod';
import { TANAKH_BOOKS } from '@/lib/tanakh-data';

const API_BASE_URL = 'https://www.sefaria.org/api/texts';

const SefariaResponseSchema = z.object({
  ref: z.string(),
  heRef: z.string(),
  he: z.string(),
  text: z.string(),
  book: z.string(),
  sections: z.array(z.number()),
  toSections: z.array(z.number()),
});

export type RandomTanakhResult = z.infer<typeof SefariaResponseSchema>;

async function fetchVersesFromApi(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
): Promise<RandomTanakhResult | null> {
  const ref = `${book}.${chapter}.${startVerse}-${endVerse}`;
  const url = `${API_BASE_URL}/${ref}?context=0&commentary=0`;
  try {
    console.log("url", url);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      // Sefaria API might return 404 for invalid verse ranges, which is expected.
      if (response.status === 404) {
        console.warn(`Sefaria API: Not found for ref ${ref}`);
        return null;
      }
      throw new Error(`Sefaria API error: ${response.statusText} on ${url}`);
    }
    const data = await response.json();

    // Sefaria returns an error object on invalid refs even with a 200 OK
    if (data.error) {
      console.warn(`Sefaria API error in response for ${ref}: ${data.error}`);
      return null;
    }

    const parsed = SefariaResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Zod validation error for Sefaria API:', parsed.error);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

export async function getRandomTanakhVerses(
  bookName: string,
  verseCount: number
): Promise<RandomTanakhResult | null> {
  let selectedBook;

  if (bookName === 'all') {
    selectedBook = TANAKH_BOOKS[Math.floor(Math.random() * TANAKH_BOOKS.length)];
  } else {
    selectedBook = TANAKH_BOOKS.find((b) => b.name === bookName);
  }

  if (!selectedBook) {
    throw new Error('Could not find the selected book.');
  }

  if (verseCount > 20) {
    throw new Error('You can request a maximum of 20 verses at a time.');
  }
  
  // The Sefaria API can be complex with verse counts.
  // We'll try fetching a random chapter and checking if it has enough verses.
  for (let i = 0; i < 5; i++) { // Try up to 5 times
    const randomChapter = Math.floor(Math.random() * selectedBook.chapters) + 1;
    
    // Fetch a single verse to see if the chapter is valid
    const chapterCheck = await fetchVersesFromApi(selectedBook.name, randomChapter, 1, 1);
    
    if (chapterCheck) {
      // To find total verses, we could try fetching a large number, but let's try a different approach.
      // Sefaria's index API can give us section lengths.
      const indexUrl = `https://www.sefaria.org/api/index/${selectedBook.name.replace(/ /g, '_')}`;
      const indexResponse = await fetch(indexUrl, { cache: 'force-cache' });
      if (indexResponse.ok) {
        const indexData = await indexResponse.json();
        const totalVersesInChapter = indexData.lengths?.[randomChapter - 1];

        if (totalVersesInChapter && verseCount <= totalVersesInChapter) {
          const maxStartVerse = totalVersesInChapter - verseCount + 1;
          const startVerse = Math.floor(Math.random() * maxStartVerse) + 1;
          const endVerse = startVerse + verseCount - 1;

          const finalResult = await fetchVersesFromApi(selectedBook.name, randomChapter, startVerse, endVerse);
          if (finalResult) {
            return finalResult;
          }
        }
      }
    }
  }

  throw new Error(`Could not find a suitable chapter in "${selectedBook.name}" with at least ${verseCount} verses after several attempts.`);
}
