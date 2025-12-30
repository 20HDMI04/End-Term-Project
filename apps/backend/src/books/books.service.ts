import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotImplementedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import type { UploadedFile } from 'src/common/types/types';
import { S3Service } from 'src/s3/s3.service';
import { PrismaService } from 'src/prisma.service';
import { GenresService } from 'src/genres/genres.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ExternalBookResponse } from './interfaces/externalBook';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
    private readonly genresService: GenresService,
    private readonly httpService: HttpService,
  ) {}

  async create(file: UploadedFile, createBookDto: CreateBookDto) {
    const existingIsbn = await this.prisma.bookIsbn.findFirst({
      where: { isbnNumber: { in: createBookDto.isbns } },
    });

    if (existingIsbn) {
      throw new ConflictException(
        `The ISBN (${existingIsbn.isbnNumber}) already exists!`,
      );
    }

    let s3Result;
    try {
      s3Result = await this.s3Service.uploadImage(
        file,
        'book',
        createBookDto.title,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while uploading the image.',
      );
    }
    try {
      const genres = await this.genresService.getOrCreateMany(
        createBookDto.genreNames,
      );

      const result = await this.prisma.book.create({
        data: {
          title: createBookDto.title,
          description: createBookDto.description,
          googleBookId: createBookDto.googleBookId,
          openLibraryId: createBookDto.openLibraryId,

          authorId: createBookDto.authorId || undefined,
          originalPublisher: createBookDto.originalPublisher,
          originalPublicationYear: createBookDto.originalPublicationYear,
          latestPublicationYear: createBookDto.latestPublicationYear,
          pageNumber: createBookDto.pageNumber || 0,

          smallerCoverPic: s3Result.small,
          biggerCoverPic: s3Result.large,
          smallerCoverPicKey: s3Result.keys[0],
          biggerCoverPicKey: s3Result.keys[1],

          isbns: {
            create: createBookDto.isbns.map((isbn) => ({ isbnNumber: isbn })),
          },
          genres: {
            create: genres.map((g) => ({
              genre: { connect: { id: g.id } },
            })),
          },
          statistics: { create: {} },
        },
        include: {
          isbns: true,
          genres: { include: { genre: true } },
          author: true,
        },
      });
      return result;
    } catch (error) {
      await this.s3Service
        .deleteImages('book', s3Result.keys)
        .catch((err) => console.error('S3 Rollback error:', err));

      if (error.code === 'P2002') {
        throw new ConflictException(
          'A book with the same title already exists.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the book.',
      );
    }
  }

  async getOrFetchExternalBook(isbn: string) {
    const cleanIsbn = isbn.replace(/[- ]/g, '');

    // 1. Check local database for existing ISBN
    const existingIsbn = await this.prisma.bookIsbn.findUnique({
      where: { isbnNumber: cleanIsbn },
      include: { book: { include: { author: true, isbns: true } } },
    });
    if (existingIsbn)
      return { status: 'ALREADY_EXISTS', book: existingIsbn.book };

    // 2. Fetch from external APIs
    let externalBook: ExternalBookResponse | null =
      await this.fetchFromGoogleApi(cleanIsbn);
    if (!externalBook) {
      // Fallback to Open Library
      externalBook = await this.fetchFromOpenLibrary(cleanIsbn);
    }

    // If not found in either API
    if (!externalBook) {
      return {
        status: 'BOOK_NOT_FOUND_EXTERNAL',
      };
    }

    if (externalBook.genreNames && externalBook.genreNames.length > 0) {
      const dbGenres = await this.genresService.getOrCreateMany(
        externalBook.genreNames,
      );
      console.log('[BOOKSERVICE]:', externalBook);

      externalBook.genreNames = dbGenres.map((g) => g.name);
    }

    // 3. Duplication check (Google ID, OL ID, Author + Title)
    let orConditions: any[] = [];
    if (externalBook.googleBookId)
      orConditions.push({ googleBookId: externalBook.googleBookId });
    if (externalBook.openLibraryId)
      orConditions.push({ openLibraryId: externalBook.openLibraryId });

    // Author + Title search
    const exactDuplicate = await this.prisma.book.findFirst({
      where: {
        OR: [
          ...orConditions,
          {
            title: { equals: externalBook.title, mode: 'insensitive' as const },
            author: {
              name: {
                contains: externalBook.authors[0],
                mode: 'insensitive' as const,
              },
            },
          },
        ],
      },
      include: { isbns: true },
    });

    if (exactDuplicate) {
      // 1. Identifier update: If the DB doesn't have the Google or OL id, but we got it from the API now
      const updateData: any = {};
      if (externalBook.googleBookId && !exactDuplicate.googleBookId)
        updateData.googleBookId = externalBook.googleBookId;
      if (externalBook.openLibraryId && !exactDuplicate.openLibraryId)
        updateData.openLibraryId = externalBook.openLibraryId;

      if (Object.keys(updateData).length > 0) {
        await this.prisma.book.update({
          where: { id: exactDuplicate.id },
          data: updateData,
        });
      }

      // 2. ISBN sync: Add new ISBNs from externalBook to the existing record
      const newIsbns = externalBook.allIsbns.filter(
        (extIsbn) =>
          !exactDuplicate.isbns.some((dbIsbn) => dbIsbn.isbnNumber === extIsbn),
      );

      if (newIsbns.length > 0) {
        await this.prisma.bookIsbn.createMany({
          data: newIsbns.map((nIsbn) => ({
            isbnNumber: nIsbn as string,
            bookId: exactDuplicate.id,
          })),
          skipDuplicates: true,
        });
      }

      // Update and return the complete book record
      const updatedBook = await this.prisma.book.findUnique({
        where: { id: exactDuplicate.id },
        include: { author: true, isbns: true },
      });

      return { status: 'LINKED_TO_EXISTING', book: updatedBook };
    }

    // 4. SPECIAL PART: Author matches, but title does not (Possible translation)
    const authorBooks = await this.prisma.book.findMany({
      where: {
        author: {
          name: {
            contains: externalBook.authors[0],
            mode: 'insensitive' as const,
          },
        },
      },
      include: { isbns: true },
    });

    if (authorBooks.length > 0) {
      // Existing books by the same author found => send to user for confirmation
      return {
        status: 'POSSIBLE_TRANSLATION',
        externalBook,
        existingBooksFromAuthor: authorBooks,
      };
    }

    // 5. Possible New Book
    return { status: 'NEW_BOOK_FOUND', book: externalBook };
  }

  async approve(id: string) {
    try {
      return await this.prisma.book.update({
        where: { id },
        data: { approveStatus: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ConflictException(
          'The book with the given ID does not exist.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while approving the book.',
      );
    }
  }

  async disapprove(id: string) {
    try {
      return await this.prisma.book.update({
        where: { id },
        data: { approveStatus: false },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ConflictException(
          'The book with the given ID does not exist.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while approving the book.',
      );
    }
  }

  async fetchFromGoogleApi(isbn: string): Promise<ExternalBookResponse | null> {
    try {
      // Clean ISBN (remove hyphens/spaces)
      const cleanIsbn = isbn.replace(/[- ]/g, '');
      const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`;

      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      const info = item.volumeInfo;

      // Collect all ISBNs
      const isbns = info.industryIdentifiers?.map((id) => id.identifier) || [];
      if (!isbns.includes(cleanIsbn)) isbns.push(cleanIsbn);

      const publishedDateRaw = info.publishedDate || '';
      const year = publishedDateRaw
        ? new Date(publishedDateRaw).getFullYear()
        : undefined;

      console.log('Fetched from Google API:', info.categories);
      // Return normalized data
      return {
        googleBookId: item.id, // Google Volume ID (e.g., "lVDoAAAACAAJ")
        title: info.title,
        authors: info.authors || [],
        description: info.description || '',
        genreNames: info.categories || [],
        pageCount: info.pageCount,
        publisher: info.publisher,
        originalPublicationYear: year,
        publishedDate: info.publishedDate,
        language: info.language,
        imageLinks: {
          thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
          smallThumbnail: info.imageLinks?.smallThumbnail?.replace(
            'http:',
            'https:',
          ),
        },
        allIsbns: [...new Set(isbns)] as string[], // Unique ISBNs
      };
    } catch (error) {
      this.logger.error(
        `Google API error while fetching ISBN (${isbn}): ${error.message}`,
      );
      return null;
    }
  }

  async fetchFromOpenLibrary(
    isbn: string,
  ): Promise<ExternalBookResponse | null> {
    try {
      const cleanIsbn = isbn.replace(/[- ]/g, '');

      const config = {
        headers: {
          'User-Agent': 'Readsy/1.0 (contact: heropista@gmail.com)',
        },
      };

      // 1.: Get book data by ISBN
      const url = `https://openlibrary.org/isbn/${cleanIsbn}.json`;
      const { data } = await firstValueFrom(this.httpService.get(url, config));

      if (!data) return null;

      // 2.: Fetch author names (OL only returns IDs by default)
      const authorNames: string[] = [];
      if (data.authors) {
        for (const auth of data.authors) {
          const authData = await firstValueFrom(
            this.httpService.get(`https://openlibrary.org${auth.key}.json`),
          );
          authorNames.push(authData.data.name);
        }
      }

      // Normalize data to match the Google API response format
      return {
        openLibraryId: data.key, // e.g., "/books/OL123M"
        title: data.title,
        authors: authorNames,
        description:
          typeof data.description === 'string'
            ? data.description
            : data.description?.value || '',
        genreNames: [],
        pageCount: data.number_of_pages,
        publisher: data.publishers?.[0],
        publishedDate: data.publish_date,
        language: data.languages?.[0]?.key?.split('/').pop() || 'unknown',
        imageLinks: {
          thumbnail: data.covers
            ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`
            : null,
          smallThumbnail: data.covers
            ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-S.jpg`
            : null,
        },
        allIsbns: [
          ...new Set([
            ...(data.isbn_10 || []),
            ...(data.isbn_13 || []),
            cleanIsbn,
          ]),
        ],
      };
    } catch (error) {
      this.logger.warn(`Open Library API hiba: ${error.message}`);
      return null;
    }
  }

  async findAll() {
    return new NotImplementedException('Find all books not implemented yet.');
  }

  async findOne(id: string) {
    return await this.prisma.book.findUniqueOrThrow({
      where: { id },
      include: {
        isbns: true,
        genres: { include: { genre: true } },
        author: true,
      },
    });
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    try {
      return new NotImplementedException('Update book not implemented yet.');
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ConflictException(
          'The book with the given ID does not exist.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the book.',
      );
    }
  }

  async remove(id: string) {
    const res = await this.prisma.book.findUniqueOrThrow({
      where: { id },
      select: {
        smallerCoverPicKey: true,
        biggerCoverPicKey: true,
      },
    });

    try {
      await this.prisma.book.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ConflictException(
          'The book with the given ID does not exist.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the book.',
      );
    }

    try {
      await this.s3Service.deleteImages('book', [
        res.smallerCoverPicKey,
        res.biggerCoverPicKey,
      ]);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while deleting the book images from S3.',
      );
    }

    return { message: 'Book successfully deleted.', deletedBook: res };
  }
}
