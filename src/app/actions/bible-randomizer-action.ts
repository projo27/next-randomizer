'use server';

import { z } from 'zod';
import { BIBLE_BOOKS } from '@/lib/bible-data';

const API_BASE_URL = 'https://bible-api.com';

const VerseSchema = z.object({
  book_id: z.string(),
  book_name: z.string(),
  chapter: z.number(),
  verse: z.number(),
  text: z.string(),
});

const BibleApiResponseSchema = z.object({
  reference: z.string(),
  verses: z.array(VerseSchema),
  text: z.string(),
  translation_id: z.string(),
  translation_name: z.string(),
  translation_note: z.string(),
});

export type RandomVerseResult = z.infer<typeof BibleApiResponseSchema>;

async function fetchVersesFromApi(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
  translation: string,
): Promise<RandomVerseResult | null> {
  const url = `${API_BASE_URL}/${book}+${chapter}:${startVerse}-${endVerse}?translation=${translation}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Verses not found for ${book} ${chapter}:${startVerse}-${endVerse}. This can happen if the chapter/verse range is invalid.`);
        return null;
      }
      throw new Error(`Bible API error: ${response.statusText} on ${url}`);
    }
    const data = await response.json();
    const parsed = BibleApiResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Zod validation error for Bible API:', parsed.error);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

export async function getRandomBibleVerses(
  bookName: string,
  verseCount: number,
  translationId: string,
): Promise<RandomVerseResult | null> {
  let selectedBook;

  if (bookName === 'all') {
    selectedBook = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
  } else {
    selectedBook = BIBLE_BOOKS.find((b) => b.name === bookName);
  }

  if (!selectedBook) {
    throw new Error('Could not find the selected book.');
  }

  if (verseCount > 20) {
    throw new Error('You can request a maximum of 20 verses at a time.');
  }
  
  // To get verses, we first need to know how many verses are in a chapter.
  // The bible-api doesn't provide chapter lengths easily.
  // For simplicity, we'll fetch a chapter and see how many verses it has.
  // This is not perfectly efficient, but works for a randomizer.
  // We will try a few times in case we pick a chapter that is too short.
  for (let i = 0; i < 5; i++) { // Try up to 5 times
    const randomChapter = Math.floor(Math.random() * selectedBook.chapters) + 1;
    
    // Fetch the entire chapter to check its length
    const chapterData = await fetchVersesFromApi(selectedBook.name, randomChapter, 1, 200, translationId); // Fetch up to 200 verses, most chapters are shorter.
    
    if (chapterData && chapterData.verses.length > 0) {
      const totalVersesInChapter = chapterData.verses.length;
      if (verseCount > totalVersesInChapter) {
        // The requested count is larger than the chapter itself. Let's try another chapter.
        continue;
      }

      const maxStartVerse = totalVersesInChapter - verseCount + 1;
      const startVerse = Math.floor(Math.random() * maxStartVerse) + 1;
      const endVerse = startVerse + verseCount - 1;

      // Now fetch the exact range we need.
      const finalResult = await fetchVersesFromApi(selectedBook.name, randomChapter, startVerse, endVerse, translationId);
      if (finalResult) {
        return finalResult;
      }
    }
  }

  throw new Error(`Could not find a suitable chapter in "${selectedBook.name}" with at least ${verseCount} verses after several attempts.`);
}
