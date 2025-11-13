'use server';

import { z } from 'zod';
import type { BookResult } from '@/types/book-result';

const API_BASE_URL = 'https://openlibrary.org';

// A server-side list of genres to pick from when 'all' is selected.
const ALL_GENRES = [
  'science_fiction', 'fantasy', 'mystery', 'romance', 'thriller',
  'history', 'biography', 'science', 'psychology', 'philosophy',
  'adventure', 'horror', 'love', 'technology', 'art'
];

// --- Zod Schemas for API validation ---
const SubjectWorkSchema = z.object({
  key: z.string(),
  title: z.string(),
  authors: z.array(z.object({ name: z.string() })).min(1),
  cover_id: z.number().nullable().optional(),
  first_publish_year: z.number().optional(),
  language: z.array(z.string()).optional(),
});

const SubjectResponseSchema = z.object({
  works: z.array(SubjectWorkSchema),
  work_count: z.number(),
});

const WorkResponseSchema = z.object({
  description: z.union([
    z.string(),
    z.object({ type: z.string(), value: z.string() })
  ]).optional(),
  publishers: z.array(z.string()).optional(),
  number_of_pages: z.number().optional(),
});


// --- Helper Function to Fetch from Open Library ---
async function fetchFromApi(endpoint: string) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.statusText} on ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    if (error instanceof Error) throw error;
    throw new Error('An unknown error occurred while fetching from Open Library API.');
  }
}

// --- Server Action to get a random book ---
export async function getRandomBook(genre: string, languageCode: string): Promise<BookResult | null> {
  let selectedGenre = genre;

  if (selectedGenre === 'all') {
    selectedGenre = ALL_GENRES[Math.floor(Math.random() * ALL_GENRES.length)];
  }

  // 1. Get a list of works for the given genre
  const randomOffset = Math.floor(Math.random() * 200); // Reduce offset for better results
  const subjectData = await fetchFromApi(`/subjects/${selectedGenre}.json?limit=100&offset=${randomOffset}`);
  const subjectValidation = SubjectResponseSchema.safeParse(subjectData);

  if (!subjectValidation.success || subjectValidation.data.works.length === 0) {
    console.error('Failed to parse subject data or no works found:', subjectValidation.error);
    return null;
  }

  // Filter works by cover and language if specified
  let works = subjectValidation.data.works.filter(work => work.cover_id);
  if (languageCode !== 'all' && works.length > 0) {
    works = works.filter(work => work.language?.includes(languageCode));
  }
  
  if (works.length === 0) {
    return null; // No books found with the specified criteria
  }

  const randomWork = works[Math.floor(Math.random() * works.length)];

  // 3. Fetch the work's details to get description, publisher, and page count
  const workKey = randomWork.key;
  let description: string | null = null;
  let publisher: string | null = null;
  let pageCount: number | null = null;
  
  try {
    const workData = await fetchFromApi(`${workKey}.json`);
    const workValidation = WorkResponseSchema.safeParse(workData);
    if (workValidation.success) {
      const data = workValidation.data;
      if (data.description) {
        description = typeof data.description === 'string' ? data.description : data.description.value;
        description = description.split(/[\n\r]----/)[0].trim();
      }
      publisher = data.publishers?.[0] || null;
      pageCount = data.number_of_pages || null;
    }
  } catch (e) {
    console.warn(`Could not fetch full details for ${workKey}`);
  }

  // 4. Construct the final result object
  const coverUrl = `https://covers.openlibrary.org/b/id/${randomWork.cover_id}-L.jpg`;
  const openLibraryUrl = `${API_BASE_URL}${workKey}`;

  return {
    title: randomWork.title,
    author: randomWork.authors.map(a => a.name).join(', '),
    coverUrl,
    openLibraryUrl,
    description,
    publishDate: randomWork.first_publish_year?.toString() || null,
    publisher,
    language: randomWork.language?.[0] || null,
    pageCount,
  };
}
