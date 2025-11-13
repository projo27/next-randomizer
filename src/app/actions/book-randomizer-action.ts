'use server';

import { z } from 'zod';
import type { BookResult } from '@/types/book-result';

const API_BASE_URL = 'https://openlibrary.org';

// --- Zod Schemas for API validation ---
const SubjectResponseSchema = z.object({
  works: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      authors: z.array(z.object({ name: z.string() })).min(1),
      cover_id: z.number().nullable().optional(),
    }),
  ),
  work_count: z.number(),
});

const WorkResponseSchema = z.object({
  description: z
    .string()
    .or(z.object({ type: z.string(), value: z.string() }))
    .optional(),
});

// --- Helper Function to Fetch from Open Library ---
async function fetchFromApi(endpoint: string) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while fetching from Open Library API.');
  }
}

// --- Server Action to get a random book ---
export async function getRandomBook(genre: string): Promise<BookResult | null> {
  // 1. Get a list of works for the given genre
  // We fetch a random page to get different results each time.
  const randomOffset = Math.floor(Math.random() * 500); // Fetch from the first 500 results for relevance
  const subjectData = await fetchFromApi(`/subjects/${genre}.json?limit=50&offset=${randomOffset}`);
  const subjectValidation = SubjectResponseSchema.safeParse(subjectData);

  if (!subjectValidation.success || subjectValidation.data.works.length === 0) {
    console.error('Failed to parse subject data or no works found:', subjectValidation.error);
    return null;
  }

  // 2. Pick a random work from the list
  const works = subjectValidation.data.works.filter(work => work.cover_id); // Only pick works with covers
  if (works.length === 0) {
    return null; // No books with covers in this random batch
  }
  const randomWork = works[Math.floor(Math.random() * works.length)];

  // 3. Fetch the work's details to get the description
  const workKey = randomWork.key;
  let description: string | null = null;
  try {
    const workData = await fetchFromApi(`${workKey}.json`);
    const workValidation = WorkResponseSchema.safeParse(workData);
    if (workValidation.success && workValidation.data.description) {
      if (typeof workValidation.data.description === 'string') {
        description = workValidation.data.description;
      } else {
        description = workValidation.data.description.value;
      }
      // Clean up description
      description = description.split(/[\n\r]----/)[0].trim();
    }
  } catch (e) {
    console.warn(`Could not fetch description for ${workKey}`);
    // Continue without description if it fails
  }

  // 4. Construct the final result object
  const coverUrl = `https://covers.openlibrary.org/b/id/${randomWork.cover_id}-L.jpg`;
  const openLibraryUrl = `${API_BASE_URL}${workKey}`;

  return {
    title: randomWork.title,
    author: randomWork.authors[0].name,
    coverUrl,
    openLibraryUrl,
    description,
  };
}
