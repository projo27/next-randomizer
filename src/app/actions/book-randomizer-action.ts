
'use server';

import { z } from 'zod';
import type { BookResult } from '@/types/book-result';

const API_BASE_URL = 'https://openlibrary.org';

const ALL_GENRES = [
  'science_fiction', 'fantasy', 'mystery', 'romance', 'thriller',
  'history', 'biography', 'science', 'psychology', 'philosophy',
  'adventure', 'horror', 'love', 'technology', 'art'
];

const EditionSchema = z.object({
  isbn_10: z.array(z.string()).optional(),
  isbn_13: z.array(z.string()).optional(),
  publishers: z.array(z.string()).optional(),
  number_of_pages: z.number().optional(),
});

const SubjectWorkSchema = z.object({
  key: z.string(),
  title: z.string(),
  authors: z.array(z.object({ name: z.string() })).min(1),
  cover_id: z.number().nullable().optional(),
  first_publish_year: z.number().optional(),
  edition_keys: z.array(z.string()).optional(),
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
});

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

async function findRandomBook(genre: string, originalGenre: string): Promise<BookResult | null> {
  let selectedGenre = genre;
  if (selectedGenre === 'all') {
    selectedGenre = ALL_GENRES[Math.floor(Math.random() * ALL_GENRES.length)];
  }

  const randomOffset = Math.floor(Math.random() * 10000); // Reduced offset for better results
  const subjectData = await fetchFromApi(`/subjects/${selectedGenre}.json?limit=100&offset=${randomOffset}`);
  const subjectValidation = SubjectResponseSchema.safeParse(subjectData);

  if (!subjectValidation.success || subjectValidation.data.works.length === 0) {
    return null;
  }

  const works = subjectValidation.data.works.filter(work => work.cover_id);

  if (works.length === 0) {
    return null;
  }

  const randomWork = works[Math.floor(Math.random() * works.length)];
  const workKey = randomWork.key;
  const editionKey = randomWork.edition_keys?.[0];

  let description: string | null = null;
  let publisher: string | null = null;
  let pageCount: number | null = null;
  let isbn: string | null = null;

  try {
    const promises = [fetchFromApi(`${workKey}.json`)];
    if (editionKey) {
      promises.push(fetchFromApi(`/books/${editionKey}.json`));
    }
    const [workData, editionData] = await Promise.all(promises);

    const workValidation = WorkResponseSchema.safeParse(workData);
    if (workValidation.success && workValidation.data.description) {
      const desc = workValidation.data.description;
      description = typeof desc === 'string' ? desc : desc.value;
      description = description.split(/[\n\r]----/)[0].trim();
    }

    if (editionData) {
      const editionValidation = EditionSchema.safeParse(editionData);
      if (editionValidation.success) {
        const data = editionValidation.data;
        isbn = data.isbn_13?.[0] || data.isbn_10?.[0] || null;
        publisher = data.publishers?.[0] || null;
        pageCount = data.number_of_pages || null;
      }
    }
  } catch (e) {
    console.warn(`Could not fetch full details for ${workKey}`);
  }

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
    isbn,
    pageCount,
  };
}

export async function getRandomBook(genre: string): Promise<BookResult | null> {
  for (let i = 0; i < 3; i++) {
    const book = await findRandomBook(genre, genre);
    if (book) {
      return book;
    }
  }
  return null;
}
