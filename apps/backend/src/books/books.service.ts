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
import { Author } from 'generated/prisma';
import { PaginationDto } from './dto/pagination-book.dto';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
    private readonly genresService: GenresService,
    private readonly httpService: HttpService,
  ) {}

  async create(file: UploadedFile | null, createBookDto: CreateBookDto) {
    // ISBN, Google Book ID, Open Library ID check (duplicate prevention)
    const duplicateCheck = await this.prisma.book.findFirst({
      where: {
        OR: [
          { isbns: { some: { isbnNumber: { in: createBookDto.isbns } } } },
          { googleBookId: createBookDto.googleBookId || undefined },
          { openLibraryId: createBookDto.openLibraryId || undefined },
        ],
      },
      include: { isbns: true },
    });

    if (duplicateCheck) {
      // Megnézzük, pontosan melyik ütközött az üzenethez
      const matchedIsbn = duplicateCheck.isbns.find((i) =>
        createBookDto.isbns.includes(i.isbnNumber),
      );
      const reason = matchedIsbn
        ? `ISBN (${matchedIsbn.isbnNumber})`
        : duplicateCheck.googleBookId === createBookDto.googleBookId
          ? 'Google Book ID'
          : 'Open Library ID';

      throw new ConflictException(`A book with this ${reason} already exists!`);
    }

    // Image handling (S3 or Default)
    let s3Result: { small: string; large: string; keys: (string | null)[] };

    if (file) {
      try {
        s3Result = await this.s3Service.uploadImage(
          file,
          'book',
          createBookDto.title,
        );
      } catch (error) {
        this.logger.error(`S3 Upload Error: ${error.message}`);
        throw new InternalServerErrorException(
          'Hiba történt a kép feltöltésekor.',
        );
      }
    } else {
      // Default images
      s3Result = {
        small: 'http://localhost:4566/book-covers/default-book.jpg',
        large: 'http://localhost:4566/book-covers/default-book.jpg',
        keys: [null, null],
      };
    }

    try {
      // Prepare genres
      const genres = await this.genresService.getOrCreateMany(
        createBookDto.genreNames,
      );

      // Save
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
          approveStatus: false,

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
          statistics: true,
        },
      });

      return result;
    } catch (error) {
      //ROLLBACK:
      if (s3Result.keys.some((k) => k !== null)) {
        await this.s3Service
          .deleteImages(
            'book',
            s3Result.keys.filter((k) => k !== null) as string[],
          )
          .catch((err) => this.logger.error('S3 Rollback error:', err));
      }

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

    // Check existing ISBN in our own database
    const existingIsbn = await this.prisma.bookIsbn.findUnique({
      where: { isbnNumber: cleanIsbn },
      include: {
        book: {
          include: {
            author: true,
            isbns: true,
            genres: { include: { genre: true } },
          },
        },
      },
    });

    // IF the book already exists, return it immediately
    if (existingIsbn)
      return { status: 'ALREADY_EXISTS', book: existingIsbn.book };

    // Fetch external data in parallel (Promise.all)
    const [olData, googleData] = await Promise.all([
      this.fetchFromOpenLibrary(cleanIsbn).catch(() => null),
      this.fetchFromGoogleApi(cleanIsbn).catch(() => null),
    ]);

    if (!olData && !googleData) {
      return { status: 'BOOK_NOT_FOUND_EXTERNAL' };
    }
    console.log('Open Library Data:', olData);
    console.log('Google Books Data:', googleData);

    // Data (Merging)
    let externalBook: ExternalBookResponse = this.mergeExternalBookData(
      olData,
      googleData,
    ) as ExternalBookResponse;

    console.log('Final External Book Data after enhancement:', externalBook);

    // AUTHOR RECOGNITION (Explicit typing to avoid errors)
    let matchedAuthor: any = null;
    if (externalBook.authorOpenLibraryId) {
      matchedAuthor = await this.prisma.author.findUnique({
        where: { openLibraryId: externalBook.authorOpenLibraryId },
      });
    }

    if (!matchedAuthor && externalBook.authors.length > 0) {
      matchedAuthor = await this.prisma.author.findFirst({
        where: {
          name: { equals: externalBook.authors[0], mode: 'insensitive' },
        },
      });
    }

    if (matchedAuthor) {
      externalBook.authorId = matchedAuthor.id;
    }

    // DUPLICATION CHECK (Now with both IDs and Author ID)
    const exactDuplicate = await this.prisma.book.findFirst({
      where: {
        OR: [
          { googleBookId: externalBook.googleBookId || undefined },
          { openLibraryId: externalBook.openLibraryId || undefined },
          {
            title: { equals: externalBook.title, mode: 'insensitive' },
            authorId: externalBook.authorId || undefined,
          },
        ],
      },
      include: { isbns: true },
    });

    // EXISTING BOOK UPDATE (Google AND OL ID sync)
    if (exactDuplicate) {
      const updateData: any = {};

      // Only add to update if we still have null but got it from the API
      if (externalBook.googleBookId && !exactDuplicate.googleBookId) {
        updateData.googleBookId = externalBook.googleBookId;
      }
      if (externalBook.openLibraryId && !exactDuplicate.openLibraryId) {
        updateData.openLibraryId = externalBook.openLibraryId;
      }

      if (Object.keys(updateData).length > 0) {
        await this.prisma.book.update({
          where: { id: exactDuplicate.id },
          data: updateData,
        });
      }

      // ISBN sync
      const newIsbns = externalBook.allIsbns.filter(
        (extIsbn) =>
          !exactDuplicate.isbns.some((dbIsbn) => dbIsbn.isbnNumber === extIsbn),
      );

      if (newIsbns.length > 0) {
        await this.prisma.bookIsbn.createMany({
          data: newIsbns.map((nIsbn) => ({
            isbnNumber: nIsbn,
            bookId: exactDuplicate.id,
          })),
          skipDuplicates: true,
        });
      }

      const updatedBook = await this.prisma.book.findUnique({
        where: { id: exactDuplicate.id },
        include: {
          author: true,
          isbns: true,
          genres: { include: { genre: true } },
        },
      });

      return { status: 'LINKED_TO_EXISTING', book: updatedBook };
    }

    // CHECK FOR TRANSLATION (Same author, different title)
    if (externalBook.authorId) {
      const authorBooks = await this.prisma.book.findMany({
        where: { authorId: externalBook.authorId },
        include: { isbns: true },
      });

      if (authorBooks.length > 0) {
        return {
          status: 'POSSIBLE_TRANSLATION',
          externalBook,
          existingBooksFromAuthor: authorBooks,
        };
      }
    }

    // New Book Found
    return { status: 'NEW_BOOK_FOUND', book: externalBook };
  }

  normalizeTags(tags: string[]): string[] {
    if (!tags) return [];

    const normalized = tags
      .flatMap((tag) => tag.split(/[\/\-:,]+/).map((subTag) => subTag.trim()))
      .filter((subTag) => subTag.length > 0)
      .filter((value, index, self) => self.indexOf(value) === index);

    return normalized;
  }

  mergeExternalBookData(
    olData: ExternalBookResponse | null,
    googleData: ExternalBookResponse | null,
  ): ExternalBookResponse | null {
    if (!olData && !googleData) return null;

    if (!olData) return googleData;
    if (!googleData) return olData;

    let externalBook: ExternalBookResponse = { ...olData };

    if (!externalBook.title && googleData.title) {
      externalBook.title = googleData.title;
    }

    const isOlDescriptionWeak =
      !externalBook.description || externalBook.description.length < 50;
    if (isOlDescriptionWeak && googleData.description) {
      externalBook.description = googleData.description;
    }

    if (googleData.genreNames?.length > 0)
      externalBook.genreNames.push(...googleData.genreNames);

    externalBook.genreNames = this.normalizeTags(externalBook.genreNames);

    if (
      (!externalBook.genreNames || externalBook.genreNames.length === 0) &&
      googleData.genreNames
    ) {
      externalBook.genreNames = googleData.genreNames;
    }

    if (!externalBook.pageCount && googleData.pageCount) {
      externalBook.pageCount = googleData.pageCount;
    }

    if (!externalBook.publisher && googleData.publisher) {
      externalBook.publisher = googleData.publisher;
    }

    if (
      !externalBook.originalPublicationYear &&
      googleData.originalPublicationYear
    ) {
      externalBook.originalPublicationYear = googleData.originalPublicationYear;
    }

    if (
      (!externalBook.authors || externalBook.authors.length === 0) &&
      googleData.authors
    ) {
      externalBook.authors = googleData.authors;
    }

    const mergedIsbns = new Set([
      ...(externalBook.allIsbns || []),
      ...(googleData.allIsbns || []),
    ]);
    externalBook.allIsbns = Array.from(mergedIsbns);

    if (googleData.googleBookId) {
      externalBook.googleBookId = googleData.googleBookId;
    }
    if (olData.openLibraryId) {
      externalBook.openLibraryId = olData.openLibraryId;
    }

    return externalBook;
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
      const cleanIsbn = isbn.replace(/[- ]/g, '');
      const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`;

      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      const info = item.volumeInfo;

      // ISBN-ek gyűjtése
      const isbns = info.industryIdentifiers?.map((id) => id.identifier) || [];
      if (!isbns.includes(cleanIsbn)) isbns.push(cleanIsbn);

      const publishedDateRaw = info.publishedDate || '';
      const year = publishedDateRaw
        ? new Date(publishedDateRaw).getFullYear()
        : undefined;

      // Google API-nál az authorOpenLibraryId mindig undefined lesz,
      // mert a Google nem ismeri az OL azonosítókat.
      return {
        googleBookId: item.id,
        openLibraryId: undefined, // Google-nél nincs OL ID
        authorOpenLibraryId: undefined, // Ezt itt nem tudjuk kinyerni
        title: info.title,
        authors: info.authors || [],
        description: info.description || '',
        genreNames: info.categories || [],
        pageCount: info.pageCount,
        publisher: info.publisher,
        originalPublicationYear: year,
        language: info.language,
        allIsbns: [...new Set(isbns)] as string[],
      } as ExternalBookResponse;
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

      // Get book data by ISBN
      const url = `https://openlibrary.org/isbn/${cleanIsbn}.json`;
      const { data } = await firstValueFrom(this.httpService.get(url, config));

      if (!data) return null;

      const authorNames: string[] = [];
      let authorOpenLibraryId: string | undefined = undefined;

      if (data.authors && data.authors.length > 0) {
        // Get first author ID (e.g., "/authors/OL26320A" -> "OL26320A")
        authorOpenLibraryId = data.authors[0].key.replace('/authors/', '');

        for (const auth of data.authors) {
          const authData = await firstValueFrom(
            this.httpService.get(`https://openlibrary.org${auth.key}.json`),
          );
          authorNames.push(authData.data.name);
        }
      }
      console.log('Author Names from OL:', data.subjects, authorNames);
      // Normalize data
      return {
        openLibraryId: data.key,
        authorOpenLibraryId,
        title: data.title,
        authors: authorNames,
        description:
          typeof data.description === 'string'
            ? data.description
            : data.description?.value || '',
        genreNames: data.subjects || [],
        pageCount: data.number_of_pages,
        publisher: data.publishers?.[0],
        originalPublicationYear: data.publish_date
          ? new Date(data.publish_date).getFullYear()
          : undefined,
        language: data.languages?.[0]?.key?.split('/').pop() || 'unknown',
        allIsbns: [
          ...new Set([
            ...(data.isbn_10 || []),
            ...(data.isbn_13 || []),
            cleanIsbn,
          ]),
        ],
      } as ExternalBookResponse;
    } catch (error) {
      this.logger.warn(`Open Library API hiba: ${error.message}`);
      return null;
    }
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    if (search) {
      whereCondition.name = { contains: search, mode: 'insensitive' };
    }

    let orderBy: any = {};

    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'favorites':
        orderBy = { favoritedBy: { _count: sortOrder } };
        break;
      case 'booksCount':
        orderBy = { books: { _count: sortOrder } };
        break;
      case 'createdAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'rating':
        return this.findAllSortedByRating(
          whereCondition,
          skip,
          limit,
          sortOrder,
        );
      default:
        orderBy = { name: 'asc' };
    }

    try {
      const [data, total] = await Promise.all([
        this.prisma.genres.findMany({
          where: whereCondition,
          skip,
          take: limit,
          orderBy,
          include: {
            _count: {
              select: {
                books: true,
                favoritedBy: true,
              },
            },
          },
        }),
        this.prisma.genres.count({ where: whereCondition }),
      ]);

      const lastPage = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          lastPage,
          hasNextPage: page < lastPage,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      console.error('Prisma Error in findAll:', error);
      throw new InternalServerErrorException(
        'Hiba történt a műfajok listázása közben.',
      );
    }
  }

  async findAllSortedByRating(
    whereCondition: any,
    skip: number,
    limit: number,
    sortOrder: 'asc' | 'desc',
  ) {
    try {
      const [data, total] = await Promise.all([
        this.prisma.book.findMany({
          where: {
            ...whereCondition,
          },
          skip: skip,
          take: limit,
          include: {
            author: {
              select: { name: true },
            },
            statistics: {
              select: {
                averageRating: true,
                ratingCount: true,
              },
            },
            genres: {
              include: {
                genre: { select: { name: true } },
              },
            },
          },
          orderBy: {
            statistics: {
              averageRating: sortOrder,
            },
          },
        }),
        this.prisma.book.count({ where: whereCondition }),
      ]);

      return {
        data,
        meta: {
          total,
          page: Math.floor(skip / limit) + 1,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in findAllSortedByRating (Books):', error);
      throw new InternalServerErrorException(
        'An error occurred while fetching books sorted by rating.',
      );
    }
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

  async update(
    id: string,
    file: UploadedFile | null,
    updateBookDto: UpdateBookDto,
  ) {
    // Check if the book exists
    const existingBook = await this.prisma.book.findUnique({
      where: { id },
      include: { isbns: true },
    });

    if (!existingBook) {
      throw new NotFoundException(`A könyv (ID: ${id}) nem található.`);
    }

    // 2. Conflict check: If the admin modifies identifiers,
    // check if they are already taken by another book.
    if (
      updateBookDto.googleBookId ||
      updateBookDto.openLibraryId ||
      updateBookDto.isbns
    ) {
      const conflict = await this.prisma.book.findFirst({
        where: {
          id: { not: id },
          OR: [
            { googleBookId: updateBookDto.googleBookId || undefined },
            { openLibraryId: updateBookDto.openLibraryId || undefined },
            {
              isbns: {
                some: { isbnNumber: { in: updateBookDto.isbns || [] } },
              },
            },
          ],
        },
      });

      if (conflict) {
        throw new ConflictException(
          'A megadott azonosítók (ISBN, Google ID vagy OL ID) már egy másik könyvhöz tartoznak.',
        );
      }
    }

    // Image handling (S3 deletion and upload)
    let s3Result = {
      small: existingBook.smallerCoverPic,
      large: existingBook.biggerCoverPic,
      keys: [existingBook.smallerCoverPicKey, existingBook.biggerCoverPicKey],
    };

    if (file) {
      if (existingBook.smallerCoverPicKey) {
        await this.s3Service
          .deleteImages('book', [
            existingBook.smallerCoverPicKey,
            existingBook.biggerCoverPicKey as string,
          ])
          .catch((err) => this.logger.error(`S3 törlési hiba: ${err.message}`));
      }

      const upload = await this.s3Service.uploadImage(
        file,
        'book',
        updateBookDto.title || existingBook.title,
      );
      s3Result = {
        small: upload.small,
        large: upload.large,
        keys: upload.keys,
      };
    }

    // Save
    try {
      return await this.prisma.book.update({
        where: { id },
        data: {
          title: updateBookDto.title,
          description: updateBookDto.description,
          googleBookId: updateBookDto.googleBookId,
          openLibraryId: updateBookDto.openLibraryId,
          authorId: updateBookDto.authorId,
          originalPublisher: updateBookDto.originalPublisher,
          originalPublicationYear: updateBookDto.originalPublicationYear,
          latestPublicationYear: updateBookDto.latestPublicationYear,
          pageNumber: updateBookDto.pageNumber,
          approveStatus: updateBookDto.approveStatus,

          smallerCoverPic: s3Result.small,
          biggerCoverPic: s3Result.large,
          smallerCoverPicKey: s3Result.keys[0],
          biggerCoverPicKey: s3Result.keys[1],

          // Genres
          genres: updateBookDto.genreNames
            ? {
                deleteMany: {},
                create: (
                  await this.genresService.getOrCreateMany(
                    updateBookDto.genreNames,
                  )
                ).map((g) => ({
                  genre: { connect: { id: g.id } },
                })),
              }
            : undefined,

          // ISBNs
          isbns: updateBookDto.isbns
            ? {
                deleteMany: {},
                create: updateBookDto.isbns.map((isbn) => ({
                  isbnNumber: isbn,
                })),
              }
            : undefined,
        },
        include: {
          author: true,
          isbns: true,
          genres: { include: { genre: true } },
        },
      });
    } catch (error) {
      this.logger.error(`Update hiba: ${error.message}`);
      throw new InternalServerErrorException(
        'Hiba történt a könyv frissítésekor.',
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
      await this.s3Service.deleteImages(
        'book',
        [res.smallerCoverPicKey, res.biggerCoverPicKey].filter(
          (key): key is string => key !== null,
        ),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while deleting the book images from S3.',
      );
    }

    return { message: 'Book successfully deleted.', deletedBook: res };
  }
}
