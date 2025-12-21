'use server';

import { z } from 'zod';

const API_BASE_URL = 'https://bible-api.com';

/* -------------------------------------------------------------------------- */
/*                                Schema Definitions                          */
/* -------------------------------------------------------------------------- */

const BookSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const ChapterSchema = z.object({
  chapter: z.number(),
});

const VerseSchema = z.object({
  book_id: z.string(),
  book: z.string(),
  chapter: z.number(),
  verse: z.number(),
  text: z.string(),
});

const TranslationSchema = z.object({
  identifier: z.string(),
  name: z.string(),
  language: z.string(),
  language_code: z.string(),
  license: z.string(),
});

const BibleApiResponseSchema = z.object({
  translation: TranslationSchema,
  verses: z.array(VerseSchema),
  text: z.string().nullable().optional(),
});

const BooksResponseSchema = z.object({
  books: z.array(BookSchema),
});

const BookDataResponseSchema = z.object({
  chapters: z.array(ChapterSchema),
});

export type RandomVerseResult = z.infer<typeof BibleApiResponseSchema>;
export type BibleBook = z.infer<typeof BookSchema>;

/* -------------------------------------------------------------------------- */
/*                                Server Actions                              */
/* -------------------------------------------------------------------------- */

/**
 * Fetches the list of available books for a specific translation.
 */
export async function getBooks(translationId: string): Promise<BibleBook[]> {
  const url = `${API_BASE_URL}/data/${translationId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Fallback or error handling
      console.error(`Failed to fetch books for ${translationId}: ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    const parsed = BooksResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error('Zod validation error (Books):', parsed.error);
      return [];
    }

    return parsed.data.books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

/**
 * Fetches random verses using a dynamic strategy:
 * 1. If bookId is 'all', picks a random book first.
 * 2. Fetches book metadata to find available chapters.
 * 3. Picks a random chapter.
 * 4. Fetches the *entire* chapter text.
 * 5. Slices the requested number of verses from the full chapter.
 */
export async function getRandomBibleVerses(
  translationId: string,
  bookId: string,
  verseCount: number,
): Promise<RandomVerseResult | null> {
  try {
    // 1. Determine the Book ID
    let selectedBookId = bookId;

    if (selectedBookId === 'all') {
      const books = await getBooks(translationId);
      if (books.length === 0) {
        throw new Error('Could not retrieve book list for this translation.');
      }
      const randomBook = books[Math.floor(Math.random() * books.length)];
      selectedBookId = randomBook.id;
    }

    // 2. Fetch Book Metadata to get Chapter count
    // URL: https://bible-api.com/data/{translation}/{bookId}
    const bookUrl = `${API_BASE_URL}/data/${translationId}/${selectedBookId}`;
    const bookRes = await fetch(bookUrl);
    if (!bookRes.ok) throw new Error(`Failed to fetch book data for ${selectedBookId}`);

    const bookDataRaw = await bookRes.json();
    const bookData = BookDataResponseSchema.safeParse(bookDataRaw);

    if (!bookData.success || bookData.data.chapters.length === 0) {
      throw new Error(`Invalid chapter data found for book ${selectedBookId}`);
    }

    // 3. Pick a Random Chapter
    const chapters = bookData.data.chapters;
    const randomChapterObj = chapters[Math.floor(Math.random() * chapters.length)];
    const chapterNum = randomChapterObj.chapter;

    // 4. Fetch the FULL Chapter Text
    // URL: https://bible-api.com/data/{translation}/{bookId}/{chapter}
    // Note: The API treats this endpoint as the "Verse" endpoint if you don't specify verses, returning the whole chapter.
    const chapterUrl = `${API_BASE_URL}/data/${translationId}/${selectedBookId}/${chapterNum}`;
    const chapterResponse = await fetch(chapterUrl);

    if (!chapterResponse.ok) {
      throw new Error(`Failed to fetch chapter ${selectedBookId} ${chapterNum}`);
    }

    const chapterJson = await chapterResponse.json();
    const parsedChapter = BibleApiResponseSchema.safeParse(chapterJson);
    // console.log(chapterUrl, chapterJson);

    if (!parsedChapter.success) {
      console.error('Zod validation error (Chapter):', parsedChapter.error);
      throw new Error('Failed to parse chapter content.');
    }

    const fullChapterResult = parsedChapter.data;
    const totalVerses = fullChapterResult.verses.length;

    if (totalVerses === 0) {
      throw new Error('Selected chapter is empty.');
    }

    // 5. Slice Random Verses
    // If requested count > available, just return all verses of the chapter
    if (verseCount >= totalVerses) {
      return fullChapterResult;
    }

    // Calculate a random start index
    // maxStart such that start + count <= total
    // i.e. start <= total - count
    // e.g. total 10, count 3. maxStart index = 10 - 3 = 7. (Indices 0..9). 
    // If we pick index 7, we take 7, 8, 9 (3 verses).
    const maxIndex = totalVerses - verseCount;
    const startIndex = Math.floor(Math.random() * (maxIndex + 1));
    const selectedVerses = fullChapterResult.verses.slice(startIndex, startIndex + verseCount);

    // Construct a new result object with only the selected verses
    // We also need to update the top-level 'text' property to match the selected verses
    const combinedText = selectedVerses.map(v => v.text.trim()).join(' ');

    // Construct the reference string (e.g., "John 3:16-18")
    // Note: parsedChapter.reference usually is "John 3" for the whole chapter.
    // We want to be specific.
    const firstVerseNum = selectedVerses[0].verse;
    const lastVerseNum = selectedVerses[selectedVerses.length - 1].verse;

    // If the original reference is just "Chapter", we reconstruct it. 
    // Usually fullChapterResult.reference is "Book Chapter", e.g. "Genesis 1"
    const bookName = fullChapterResult.verses[0].book;
    const newReference = `${bookName} ${chapterNum}:${firstVerseNum}` + (verseCount > 1 ? `-${lastVerseNum}` : '');

    return {
      ...fullChapterResult,
      // reference: newReference,
      verses: selectedVerses,
      text: combinedText
    };

  } catch (error) {
    console.error('Error in getRandomBibleVerses:', error);
    throw error;
  }
}
