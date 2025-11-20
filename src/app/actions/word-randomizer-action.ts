// src/app/actions/word-randomizer-action.ts
'use server';

import { WORDS_BY_TYPE, ALL_WORDS, PARTS_OF_SPEECH } from '@/lib/word-data';

export type PartOfSpeech = keyof typeof WORDS_BY_TYPE | 'all';

/**
 * Gets a random word, optionally filtered by a part of speech.
 * @param partOfSpeech The desired part of speech, or 'all' for any word.
 * @returns A promise that resolves to a random word string.
 */
export async function getRandomWord(partOfSpeech: PartOfSpeech): Promise<string> {
  let wordList: string[];

  if (partOfSpeech === 'all') {
    wordList = ALL_WORDS;
  } else if (WORDS_BY_TYPE[partOfSpeech]) {
    wordList = WORDS_BY_TYPE[partOfSpeech];
  } else {
    // Fallback to all words if an invalid type is somehow passed
    wordList = ALL_WORDS;
  }

  if (wordList.length === 0) {
    throw new Error('No words found for the selected category.');
  }

  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}
