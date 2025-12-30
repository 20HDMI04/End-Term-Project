export interface ExternalBookResponse {
  googleBookId?: string;
  openLibraryId?: string;
  title: string;
  authors: string[];
  description: string;
  pageCount: number;
  publisher: string;
  genreNames: string[];
  originalPublicationYear?: number;
  publishedDate?: string;
  language: string;
  imageLinks: {
    thumbnail: string | null;
    smallThumbnail: string | null;
  };
  allIsbns: string[];
}
