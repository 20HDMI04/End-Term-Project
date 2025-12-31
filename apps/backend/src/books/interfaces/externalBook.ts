export interface ExternalBookResponse {
  googleBookId?: string;
  openLibraryId?: string;
  authorOpenLibraryId?: string;
  authorId?: string;
  authors: string[];
  title: string;
  description: string;
  genreNames: string[];
  pageCount?: number;
  publisher?: string;
  originalPublicationYear?: number;
  allIsbns: string[];
}
