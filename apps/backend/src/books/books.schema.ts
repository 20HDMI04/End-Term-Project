import { create } from 'domain';
import { z } from 'zod';

export const booksSchema = z.object({
  id: z.string(),
  title: z.string().min(2).max(100),
  authorId: z.string().min(2).max(100),
  publishedDate: z.date(),
  picture: z.string(),
  publisher: z.string().min(2).max(100),
  originalPublicationYear: z.number().min(1000).max(new Date().getFullYear()),
  hungarianPublicationYear: z
    .number()
    .min(1000)
    .max(new Date().getFullYear())
    .optional(),
  isbn13: z.string().min(10).max(13),
  pageNumber: z.number().min(1).max(10000),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Book = z.infer<typeof booksSchema>;
