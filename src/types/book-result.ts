import { z } from 'zod';

export const BookResultSchema = z.object({
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().url(),
  openLibraryUrl: z.string().url(),
  description: z.string().nullable(),
  publishDate: z.string().nullable(),
  publisher: z.string().nullable(),
  isbn: z.string().nullable(),
  pageCount: z.number().nullable(),
});

export type BookResult = z.infer<typeof BookResultSchema>;
