'use server';

import { z } from 'zod';

const API_BASE_URL = 'https://api.quran.com/api/v4';

// --- Zod Schemas for API responses ---
const SurahSchema = z.object({
  id: z.number(),
  name_simple: z.string(),
  verses_count: z.number(),
});
export type Surah = z.infer<typeof SurahSchema>;

const SurahListResponseSchema = z.object({
  chapters: z.array(SurahSchema),
});

const LanguageSchema = z.object({
  id: z.number(),
  name: z.string(),
  iso_code: z.string(),
  native_name: z.string().nullable(),
});
export type Language = z.infer<typeof LanguageSchema>;

const LanguageListResponseSchema = z.object({
  languages: z.array(LanguageSchema),
});

const TranslationResourceSchema = z.object({
  id: z.number(),
  name: z.string(),
  author_name: z.string(),
  slug: z.string().nullable(),
  language_name: z.string(),
});

export type TranslationResource = z.infer<typeof TranslationResourceSchema>;

const TranslationResourceListResponseSchema = z.object({
  translations: z.array(TranslationResourceSchema),
});

const VerseSchema = z.object({
  id: z.number(),
  verse_key: z.string(),
  text_uthmani: z.string(),
  translations: z.array(z.object({
    text: z.string(),
    resource_id: z.number(),
  })).min(1).optional(),
});

const VerseResponseSchema = z.object({
  verses: z.array(VerseSchema),
});

export type RandomVerseResult = z.infer<typeof VerseSchema>;

// --- Service Functions ---

/**
 * Fetches the list of all Surahs (chapters) from the Quran API.
 */
export async function getSurahList(): Promise<Surah[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/chapters`);
    if (!response.ok) throw new Error('Failed to fetch Surah list');
    const data = await response.json();
    const parsed = SurahListResponseSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid Surah list format');
    return parsed.data.chapters;
  } catch (error) {
    console.error('Error in getSurahList:', error);
    throw error;
  }
}

/**
 * Fetches the list of available translation languages.
 */
export async function getTranslationLanguages(): Promise<Language[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/languages`, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Failed to fetch languages');
    const data = await response.json();
    const parsed = LanguageListResponseSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid language list format');
    // Filter to only include languages with available translations, and sort them
    return parsed.data.languages.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error in getTranslationLanguages:', error);
    throw error;
  }
}

/**
 * Fetches the list of available translation resources.
 */
export async function getTranslationResources(): Promise<TranslationResource[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/translations`, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Failed to fetch translation re ources');
    const data = await response.json();
    const parsed = TranslationResourceListResponseSchema.safeParse(data);
    if (!parsed.success) throw new Error('Invalid translation resources format');
    // console.log("parsed.translation", parsed.data.translations);
    // Filter to only include languages with available translations, and sort them
    return parsed.data.translations.sort((a, b) => a.language_name.localeCompare(b.language_name));
  } catch (error) {
    console.error('Error in getTranslationResources:', error);
    throw error;
  }
}

/**
 * Fetches random verses from the Quran.
 */
export async function getRandomVerses(
  surahId: number,
  verseCount: number,
  translationId: number
): Promise<RandomVerseResult[]> {
  try {
    // First, get the info for the selected surah to know its verse count
    const surahInfoResponse = await fetch(`${API_BASE_URL}/chapters/${surahId}`);
    if (!surahInfoResponse.ok) throw new Error(`Failed to fetch info for Surah ${surahId}`);
    const surahInfo = await surahInfoResponse.json();
    const totalVerses = surahInfo.chapter.verses_count;

    // console.log("surahINfo ", surahInfo, "totalVerses ", totalVerses);

    if (verseCount > totalVerses) {
      throw new Error(`The selected Surah only has ${totalVerses} verses. Cannot fetch ${verseCount} verses.`);
    }

    // Generate a random starting verse
    // Ensure the starting verse allows for the requested number of verses to be fetched
    const maxStartVerse = totalVerses - verseCount + 1;
    const startVerse = Math.floor(Math.random() * maxStartVerse) + 1;

    const fields = 'text_uthmani,chapter_id,verse_number';
    const versesUrl = `${API_BASE_URL}/quran/verses/uthmani?chapter_number=${surahId}&juz_number=${startVerse}&limit=${verseCount}`;
    const verseByChapterUrl = `${API_BASE_URL}/verses/by_chapter/${surahId}?language=en&words=false&translations=${translationId}&page=1&per_page=${verseCount}&from=${startVerse}&fields=${fields}`;

    const versesResponse = await fetch(verseByChapterUrl);
    if (!versesResponse.ok) throw new Error('Failed to fetch verses and translation');

    const data = await versesResponse.json();
    // console.log("versesUrl ", versesUrl, "verseByChapterUrl ", verseByChapterUrl, "versesData ", data);
    const parsed = VerseResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.error("Zod validation error for verses:", parsed.error);
      throw new Error('Invalid verse data format received from API.');
    }

    if (parsed.data.verses.length === 0) {
      throw new Error('No verses returned from the API for the selected range.');
    }

    return parsed.data.verses;

  } catch (error) {
    console.error('Error in getRandomVerses:', error);
    throw error;
  }
}
