
'use server';

import { z } from 'zod';

// Define the structure for the dictionary API response
const PhoneticSchema = z.object({
  text: z.string().optional(),
  audio: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
});

const DefinitionSchema = z.object({
  definition: z.string(),
  example: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
});

const MeaningSchema = z.object({
  partOfSpeech: z.string(),
  definitions: z.array(DefinitionSchema),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
});

const DictionaryEntrySchema = z.object({
  word: z.string(),
  phonetics: z.array(PhoneticSchema),
  meanings: z.array(MeaningSchema),
  sourceUrls: z.array(z.string().url()),
});

export type DictionaryEntry = z.infer<typeof DictionaryEntrySchema>;

/**
 * Fetches a random word and its dictionary definition.
 * @returns A promise that resolves to a DictionaryEntry object or null if not found.
 */
export async function getRandomDictionaryWord(): Promise<DictionaryEntry | null> {
  try {
    // Step 1: Get a random word
    const randomWordResponse = await fetch('https://random-word-api.vercel.app/api?words=1', {
      cache: 'no-store', // We want a new word every time
    });

    if (!randomWordResponse.ok) {
      throw new Error('Failed to fetch a random word.');
    }
    const randomWordArray: string[] = await randomWordResponse.json();
    const word = randomWordArray[0];

    if (!word) {
      throw new Error('No random word was returned from the API.');
    }

    // Step 2: Get the definition for that word
    const dictionaryResponse = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      { cache: 'no-store' }
    );

    // Dictionary API returns 404 if word is not found, which is a valid scenario.
    if (dictionaryResponse.status === 404) {
      console.warn(`No dictionary definition found for "${word}". Retrying...`);
      // Retry logic: call the function again to try with a new word.
      return getRandomDictionaryWord();
    }

    if (!dictionaryResponse.ok) {
        throw new Error(`Dictionary API failed with status: ${dictionaryResponse.status}`);
    }

    const dictionaryData = await dictionaryResponse.json();
    
    // The API returns an array, we'll use the first entry.
    const validation = DictionaryEntrySchema.safeParse(dictionaryData[0]);

    if (!validation.success) {
      console.error('Zod validation failed for dictionary response:', validation.error);
      // If validation fails, it might be an obscure word. Let's retry.
      return getRandomDictionaryWord();
    }
    
    return validation.data;

  } catch (error) {
    console.error('Error in getRandomDictionaryWord:', error);
    // In case of any other error, we'll try one more time.
    // Be careful with recursion depth in a real-world scenario.
    try {
        return await getRandomDictionaryWord();
    } catch (retryError) {
        console.error('Retry failed:', retryError);
        throw new Error("Failed to get a random word and its definition after multiple attempts.");
    }
  }
}
