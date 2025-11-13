import { z } from 'zod';

export const BookResultSchema = z.object({
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().url(),
  openLibraryUrl: z.string().url(),
  description: z.string().nullable(),
});

export type BookResult = z.infer<typeof BookResultSchema>;
