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
import { PaginationDto } from './dto/pagination-book.dto';

type GenreType =
  | 'history'
  | 'fiction'
  | 'romance'
  | 'young-adult'
  | 'fantasy'
  | 'just-science'
  | 'thriller'
  | 'social-science';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
    private readonly genresService: GenresService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * @summary Creates a new book entry in the database. It first checks for duplicates based on ISBNs, Google Book ID, and Open Library ID. If a cover image file is provided, it uploads it to S3; otherwise, it uses default images. The method also handles genre associations and rolls back S3 uploads if any database operation fails.
   * @param file - An optional uploaded file for the book cover image. If not provided, default images will be used.
   * @param createBookDto - A DTO containing the details of the book to be created, including title, description, identifiers (ISBNs, Google Book ID, Open Library ID), author information, publication details, and genre names.
   * @returns The created book record, including associated genres and ISBNs.
   * @throws {@link ConflictException} if a book with the same ISBN, Google Book ID, or Open Library ID already exists.
   * @throws {@link InternalServerErrorException} if there is an error during S3 upload or database operations.
   * @remarks The method performs a duplicate check to prevent multiple entries of the same book based on key identifiers. It also ensures that any uploaded images are rolled back (deleted from S3) if the database operation fails, maintaining data integrity between S3 and the database.
   */
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
      // Determine the reason for duplication (which field caused the conflict)
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
          'Error occurred while uploading the book cover image. Please try again later.',
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

  /**
   * @summary Retrieves a book by its ISBN. It first checks if the book already exists in the local database. If not, it fetches data from external sources (Open Library and Google Books APIs) in parallel, merges the data, and checks for potential matches in the local database based on identifiers and author information. The method returns the appropriate status and book data based on the findings.
   * @description This method is designed to efficiently retrieve book information using an ISBN. It performs a local database check to prevent unnecessary external API calls. If the book is not found locally, it fetches data from both Open Library and Google Books APIs simultaneously to minimize latency. The fetched data is then merged, and the method checks for potential matches in the local database based on Google Book ID, Open Library ID, and author information to determine if the book can be linked to an existing entry or if it is a new discovery. The method returns a structured response indicating the status of the retrieval process and the relevant book data.
   * @param isbn - The ISBN number of the book to be retrieved. The method will clean the ISBN by removing any hyphens or spaces before processing.
   * @returns An object containing the status of the retrieval process and the book data if found. The status can indicate whether the book already exists in the local database, was found through external APIs, linked to an existing entry, or if it is a possible translation based on author information.
   * @remarks The method uses a structured approach to handle multiple scenarios, including duplicate prevention, data merging from multiple sources, and intelligent matching based on identifiers and author information. It also includes logging for debugging purposes, especially when fetching data from external APIs.
   */
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

  /**
   * @summary Normalizes an array of tags by splitting them on common delimiters, trimming whitespace, and removing duplicates. This is used to ensure consistent formatting of genre names or other tag-like data.
   * @description The method takes an array of strings (tags) and processes each tag by splitting it on common delimiters such as slashes, hyphens, colons, and commas. It then trims any leading or trailing whitespace from the resulting sub-tags and filters out any empty strings. Finally, it removes duplicate tags to return a clean, normalized array of unique tags.
   * @param tags - An array of strings representing tags that may contain multiple sub-tags separated by common delimiters. For example, a tag like "Science Fiction / Fantasy" would be split into "Science Fiction" and "Fantasy".
   * @returns An array of normalized strings representing the unique, cleaned tags.
   */
  normalizeTags(tags: string[]): string[] {
    if (!tags) return [];

    const normalized = tags
      .flatMap((tag) => tag.split(/[\/\-:,]+/).map((subTag) => subTag.trim()))
      .filter((subTag) => subTag.length > 0)
      .filter((value, index, self) => self.indexOf(value) === index);

    return normalized;
  }

  /**
   * @summary Merges book data from Open Library and Google Books APIs into a single cohesive object. The method prioritizes non-empty and more detailed information, combining genres and ISBNs while ensuring no duplicates. It also fills in missing fields from one source with data from the other when available.
   * @description This method takes two book data objects, one from Open Library and one from Google Books, and merges them into a single object. It checks each field (title, description, genres, page count, publisher, publication year, authors, and ISBNs) and prioritizes the more complete or non-empty data. For genres and ISBNs, it combines the lists from both sources while removing duplicates. The method also ensures that if one source lacks certain information (e.g., description or publisher), it fills in those gaps with data from the other source if available.
   * @param olData - The book data retrieved from the Open Library API, which may contain fields such as title, description, genres, page count, publisher, publication year, authors, and ISBNs.
   * @param googleData - The book data retrieved from the Google Books API, which may contain similar fields as the Open Library data. This data is used to enhance or fill in missing information from the Open Library data when merging.
   * @returns The merged book data object containing information from both sources. If both sources are null, it returns null. The resulting object will have the most complete and detailed information available from either source, with combined genres and ISBNs where applicable.
   */
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

  /**
   * @summary Approves a book by setting its approveStatus to true in the database. The method takes the book ID as a parameter and updates the corresponding record. If the book with the given ID does not exist, it throws a NotFoundException. If any other error occurs during the update process, it throws an InternalServerErrorException.
   * @description This method is used to approve a book entry in the database by updating its approveStatus field to true. It first attempts to find and update the book record based on the provided ID. If the book is not found, it catches the specific error code (P2025) thrown by Prisma and responds with a NotFoundException indicating that the book does not exist. For any other errors that may occur during the update process, it logs the error and throws a generic InternalServerErrorException to indicate that an error occurred while approving the book.
   * @param id - The unique identifier of the book to be approved. This ID is used to locate the specific book record in the database that needs to be updated.
   * @throws {@link NotFoundException} if the book with the given ID does not exist in the database.
   * @returns The updated book record with approveStatus set to true if the operation is successful. If the book is not found, it returns a NotFoundException. If any other error occurs, it returns an InternalServerErrorException.
   */
  async approve(id: string) {
    try {
      return await this.prisma.book.update({
        where: { id },
        data: { approveStatus: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'The book with the given ID does not exist.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while approving the book.',
      );
    }
  }

  /**
   * @summary Disapproves a book by setting its approveStatus to false in the database.
   * @description This method is used to disapprove a book entry in the database by updating its approveStatus field to false. Similar to the approve method, it attempts to find and update the book record based on the provided ID. If the book is not found, it catches the specific error code (P2025) thrown by Prisma and responds with a NotFoundException indicating that the book does not exist. For any other errors that may occur during the update process, it logs the error and throws a generic InternalServerErrorException to indicate that an error occurred while disapproving the book.
   * @param id - The unique identifier of the book to be disapproved.
   * @returns The updated book record with approveStatus set to false if the operation is successful.
   * @throws {@link NotFoundException} if the book with the given ID does not exist in the database.
   */
  async disapprove(id: string) {
    try {
      return await this.prisma.book.update({
        where: { id },
        data: { approveStatus: false },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'The book with the given ID does not exist.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while disapproving the book.',
      );
    }
  }

  /**
   * @summary Fetches book data from the Google Books API based on its ISBN.
   * @description This method takes an ISBN number as input, cleans it by removing any hyphens or spaces, and constructs a query URL to fetch book data from the Google Books API. It uses the HttpService to make a GET request to the API and retrieves the book information. If the API returns no items or an error occurs during the fetch process, it logs the error and returns null. The method extracts relevant information from the API response, such as title, authors, description, genres, page count, publisher, publication year, language, and all associated ISBNs, and returns it in a structured format as an ExternalBookResponse object.
   * @param isbn - The ISBN number of the book to be fetched from the Google Books API. The method will clean the ISBN by removing any hyphens or spaces before making the API request.
   * @returns A structured object containing the book data retrieved from the Google Books API, including title, authors, description, genres, page count, publisher, publication year, language, and all associated ISBNs. If the book is not found or an error occurs during the fetch process, it returns null.
   * @remarks The method includes error handling to log any issues that arise during the API call, ensuring that the application can gracefully handle scenarios where the Google Books API is unavailable or returns unexpected data. It also ensures that the returned data is normalized and structured for consistent use within the application.
   */
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

      // Collect ISBNs
      const isbns = info.industryIdentifiers?.map((id) => id.identifier) || [];
      if (!isbns.includes(cleanIsbn)) isbns.push(cleanIsbn);

      const publishedDateRaw = info.publishedDate || '';
      const year = publishedDateRaw
        ? new Date(publishedDateRaw).getFullYear()
        : undefined;

      // Google API doesn't provide Open Library IDs, so we can only return Google-specific data. The OL ID and author OL ID will be filled in later if we find a match in our database or through the OL API,
      // because Google Books doesn't provide that information. We will rely on our merging logic to fill in any gaps when we combine data from both sources.
      return {
        googleBookId: item.id,
        openLibraryId: undefined, // Google API doesn't provide OL ID, so it's set to undefined
        authorOpenLibraryId: undefined, // We don't get OL author ID from Google, so it's set to undefined
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
      this.logger.warn(`Open Library API error: ${error.message}`);
      return null;
    }
  }

  /**
   * @summary Retrieves a paginated list of genres with optional search and sorting capabilities. The method allows filtering genres by name, sorting by various fields (name, number of favorites, number of books, creation date, or average rating), and includes metadata about the pagination state in the response.
   * @description This method fetches genres from the database based on the provided pagination and sorting parameters. It supports searching genres by name using a case-insensitive partial match. The sorting can be done by genre name, number of favorites, number of books, creation date, or average rating. When sorting by average rating, it performs a more complex query to calculate the average rating for each genre. The response includes the list of genres along with metadata about the total number of genres, current page, last page, and whether there are next or previous pages available.
   * @param query - An object containing pagination and sorting parameters, including page number, limit of items per page, search term for filtering by name, sorting field, and sorting order (ascending or descending).
   * @returns A promise resolving to an object containing the list of genres and pagination metadata. The genres are returned based on the applied search and sorting criteria, and the metadata provides information about the total number of genres, current page, last page, and navigation availability for next and previous pages.
   * @remarks The method includes error handling to catch and log any issues that arise during the database query process, ensuring that the application can gracefully handle errors and provide informative feedback to the client.
   */
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
        'Error occurred while fetching genres. Please try again later.',
      );
    }
  }

  /**
   * @summary Due to its complexity I choose to outsource the implementation of this method. Retrieves a paginated list of books sorted by their average rating, with optional filtering based on provided conditions. The method includes related author, genre, and rating statistics in the response, and returns metadata about the pagination state.
   * @description This method fetches books from the database based on the provided filtering conditions, pagination parameters, and sorting order. It includes related data such as the author's name, genre names, and rating statistics (average rating and rating count). The books are sorted by their average rating in either ascending or descending order as specified. The response includes metadata about the total number of books matching the conditions, current page, and last page to facilitate client-side pagination.
   * @param whereCondition - An object representing the filtering conditions to apply when retrieving books. This can include various criteria such as approval status, author ID, genre ID, or any other relevant fields that can be used to filter the book records in the database.
   * @param skip - The number of records to skip for pagination purposes. This is calculated based on the current page and the limit of items per page.
   * @param limit - The maximum number of book records to return in the response for the current page.
   * @param sortOrder - The order in which to sort the books based on their average rating. It can be either 'asc' for ascending order or 'desc' for descending order.
   * @returns A promise resolving to the paginated list of books sorted by rating along with pagination metadata.
   */
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

  /**
   * @summary Retrieves a single book by its ID.
   * @description This method fetches a book from the database based on the provided ID. It includes related data such as the author's name, genre names, and rating statistics.
   * @param id - The ID of the book to retrieve.
   * @returns A promise resolving to the book details or an error if the book is not found.
   * @throws {@link NotFoundException} if the book with the given ID does not exist in the database.
   * @throws {@link InternalServerErrorException} if an error occurs while fetching the book details.
   */
  async findOne(id: string) {
    try {
      return await this.prisma.book.findUniqueOrThrow({
        where: { id },
        include: {
          isbns: true,
          genres: { include: { genre: true } },
          author: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'The book with the given ID does not exist.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the book details.',
      );
    }
  }

  /**
   * @summary Retrieves a single book by its ISBN. The method checks the database for the provided ISBN and includes related data such as the author's name, genre names, and rating statistics. If the book with the given ISBN does not exist, it throws a NotFoundException. If any other error occurs during the fetch process, it throws an InternalServerErrorException.
   * @description This method is designed to fetch a book's details based on its ISBN number. It queries the database for a unique record matching the provided ISBN and includes related information such as the author's name, genre names, and rating statistics. The method handles errors gracefully by checking for specific error codes to determine if the book was not found and responding with appropriate exceptions. If the book is successfully retrieved, it returns the complete details of the book along with its related data.
   * @param isbn - The ISBN number of the book to retrieve. The method will clean the ISBN by removing any hyphens or spaces before processing.
   * @returns A promise resolving to the book details or an error if the book is not found.
   * @throws {@link NotFoundException} if the book with the given ISBN does not exist in the database.
   * @throws {@link InternalServerErrorException} if an error occurs while fetching the book details.
   */
  async findOneByIsbn(isbn: string) {
    try {
      return await this.prisma.bookIsbn.findUniqueOrThrow({
        where: { isbnNumber: isbn },
        include: {
          book: {
            include: {
              isbns: true,
              genres: { include: { genre: true } },
              author: {
                select: { name: true },
              },
              statistics: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'The book with the given ISBN does not exist.',
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while fetching the book details.',
      );
    }
  }

  /**
   * @summary Updates a book's details, including its cover image, metadata, genres, and ISBNs. The method checks for the existence of the book, handles potential conflicts with identifiers, manages image uploads and deletions in S3, and updates the book record in the database accordingly.
   * @description This method allows updating various aspects of a book, such as its title, description, identifiers (Google Book ID, Open Library ID), author, publication details, genres, and ISBNs. It first checks if the book exists in the database and throws a NotFoundException if it does not. It then checks for potential conflicts with the provided identifiers to ensure they are not already associated with another book. If a new cover image is provided, it handles the deletion of the old images from S3 and uploads the new image, updating the corresponding fields in the database. Finally, it updates the book record with the new details and returns the updated book information.
   * @param id - The ID of the book to update.
   * @param file - The uploaded cover image file, if applicable.
   * @param updateBookDto - The data transfer object containing the updated book details.
   * @returns A promise resolving to the updated book information or an error if the update fails.
   * @throws {@link NotFoundException} if the book with the given ID does not exist in the database.
   * @throws {@link ConflictException} if the provided identifiers (ISBN, Google ID, or Open Library ID) are already associated with another book.
   * @throws {@link InternalServerErrorException} if an error occurs while updating the book details or managing images in S3.
   */
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
      throw new NotFoundException(`The book (ID: ${id}) was not found.`);
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
          'The provided identifiers (ISBN, Google ID or OL ID) are already associated with another book.',
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
        'Error occurred while updating the book. Please try again later.',
      );
    }
  }

  /**
   * @summary Deletes a book from the database and its associated images from S3. The method first retrieves the book's image keys, then deletes the book record from the database, and finally attempts to delete the images from S3. It handles potential errors during both the database deletion and the S3 deletion processes, ensuring that appropriate exceptions are thrown if issues arise.
   * @description This method is responsible for removing a book from the database and its associated cover images from S3. It first retrieves the book's smaller and bigger cover image keys to ensure that it has the necessary information to delete the images after the book record is removed. It then attempts to delete the book record from the database, handling any potential errors that may occur during this process, such as the book not existing. After successfully deleting the book record, it proceeds to delete the associated images from S3 using the retrieved keys. If any errors occur during the S3 deletion process, it logs the error and throws an InternalServerErrorException to indicate that there was an issue while deleting the images.
   * @param id - The unique identifier of the book to be deleted. This ID is used to locate the specific book record in the database and retrieve its associated image keys for deletion from S3.
   * @throws {@link ConflictException} if the book with the given ID does not exist in the database.
   * @throws {@link InternalServerErrorException} if an error occurs while deleting the book record from the database or while deleting the images from S3.
   * @returns A promise resolving to an object containing a success message and the deleted book's information.
   */
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

  /**
   * @summary Retrieves curated sections of books for the main page, including categories such as Latest Added, Crowd Favorites, Short & Sweet, Weekend Reads, Genre Spotlights, Multi-Edition Hits, and Oldies but Goldies. Each section includes a title, subtitle, and a list of books that fit the criteria for that category.
   * @description This method compiles various sections of books to be displayed on the main page of the application. It fetches different sets of books based on specific criteria, such as the most recently added books, the highest-rated books according to user ratings, shorter books that can be read quickly, books suitable for weekend reading, a spotlight on a random genre with handpicked essentials, books that have multiple editions indicating their popularity and longevity, and classic books that have stood the test of time. Each section is structured with a title, a subtitle that provides context for the category, and the corresponding list of books that meet the criteria for that section.
   * @returns A promise resolving to an array of curated book sections. Each section contains a title, subtitle, and a list of books that fit the specific criteria for that category. The sections include Latest Added, Crowd Favorites, Short & Sweet, Weekend Reads, Genre Spotlights, Multi-Edition Hits, and Oldies but Goldies.
   * @remarks The method includes error handling to ensure that any issues encountered while fetching the different sets of books are properly logged and handled, allowing the application to gracefully manage errors and provide a consistent user experience on the main page. It also utilizes helper methods to fetch books for each specific category, ensuring that the logic for retrieving books is organized and maintainable.
   * @throws {@link InternalServerErrorException} if an error occurs while fetching any of the book sections for the main page. Each helper method responsible for fetching a specific category of books includes its own error handling to ensure that issues are properly logged and managed.
   */
  async getMainPageBooksWithSections() {
    const LatestBooks = await this.getLatestAddedBooks();
    const CrowdFavorites = await this.getCrowdFavorites();
    const ShortAndSweet = await this.getShortAndSweet();
    const WeekendReads = await this.getWeekendReads();
    const GenreSpotlight = await this.getGenreSpotlight();
    const MultiEditionHits = await this.getMultiEditionHits();
    const OldiesButGoldies = await this.getOldiesButGoldies();
    const mainPageContent = [
      {
        title: 'Just Landed',
        subtitle: 'Stay ahead with the most recent additions.',
        data: LatestBooks,
      },
      {
        title: 'Crowd Favorites',
        subtitle: 'Most-loved titles according to our community.',
        data: CrowdFavorites,
      },
      {
        title: 'Short & Sweet',
        subtitle: 'Tiny books, massive impact.',
        data: ShortAndSweet,
      },
      {
        title: 'Weekend Reads',
        subtitle: 'Perfect books to dive into over the weekend.',
        data: WeekendReads,
      },
      GenreSpotlight,
      {
        title: 'Multi-Edition Hits',
        subtitle: 'Rare finds and classic reprints with a rich history.',
        data: MultiEditionHits,
      },
      {
        title: 'Oldies but Goldies',
        subtitle: 'Vintage gems that have stood the test of time.',
        data: OldiesButGoldies,
      },
    ];
    return mainPageContent;
  }

  /**
   * @summary Retrieves the latest added books that have been approved, limited to the specified number of entries. The method includes related data such as statistics, comments, and genres for each book.
   * @description This method fetches the most recently added books from the database that have been approved for display. It limits the results to the specified number of entries and includes related information such as statistics (e.g., average rating, rating count), comments from users, and associated genres with their names. The books are ordered by their creation date in descending order to ensure that the newest additions are displayed first.
   * @returns A promise resolving to an array of the latest added books, each including its statistics, comments, and genres. The method ensures that only approved books are retrieved and that the results are limited to the specified number of entries.
   * @param take - The maximum number of latest added books to retrieve. The method will return up to this number of entries, ordered by their creation date in descending order.
   * @remarks The method includes error handling to catch and log any issues that arise during the database query process, ensuring that the application can gracefully handle errors and provide informative feedback to the client if there are issues while fetching the latest added books.
   */
  async getLatestAddedBooks(take: number = 15) {
    try {
      return await this.prisma.book.findMany({
        where: {
          approveStatus: true,
        },
        take: take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          statistics: true,
          comments: true,
          genres: {
            include: {
              genre: { select: { name: true } },
            },
          },
          isbns: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting latest books.',
      );
    }
  }

  /**
   * @summary Retrieves the crowd favorite books based on their average rating, limited to the top 15 entries. The method includes related data such as statistics, comments, and genres for each book.
   * @description This method fetches the books that are considered crowd favorites by ordering them based on their average rating in descending order. It limits the results to the top 15 entries and includes related information such as statistics (e.g., average rating, rating count), comments from users, and associated genres with their names. The method ensures that only approved books are retrieved and that the results are sorted to highlight the most popular titles according to user ratings.
   * @returns A promise resolving to an array of the top 15 crowd favorite books, each including its statistics, comments, and genres. The method ensures that only approved books are retrieved and that the results are ordered by average rating in descending order.
   */
  async getCrowdFavorites(take: number = 15) {
    try {
      return await this.prisma.book.findMany({
        where: {
          approveStatus: true,
        },
        orderBy: {
          statistics: {
            averageRating: 'desc',
          },
        },
        take: take,
        omit: {
          smallerCoverPicKey: true,
          biggerCoverPicKey: true,
        },
        include: {
          statistics: true,
          genres: {
            include: {
              genre: { select: { name: true } },
            },
          },
          comments: true,
          isbns: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting crowd favorite books.',
      );
    }
  }

  /**
   * @summary Retrieves books that are considered "Short & Sweet" based on their page number, limited to those with 100 pages or fewer. The method includes related data such as statistics, comments, and genres for each book.
   * @description This method fetches books that are categorized as "Short & Sweet" by filtering them based on their page number, specifically those that have 100 pages or fewer. It limits the results to entries that meet this criterion and includes related information such as statistics (e.g., average rating, rating count), comments from users, and associated genres with their names. The method ensures that only approved books are retrieved and that the results are filtered to highlight shorter reads that can be enjoyed quickly.
   * @returns A promise resolving to an array of "Short & Sweet" books, each including its statistics, comments, and genres.
   */
  async getShortAndSweet(take: number = 15) {
    try {
      return await this.prisma.book.findMany({
        where: {
          AND: [{ approveStatus: true }, { pageNumber: { lte: 100 } }],
        },
        take: take,
        omit: {
          smallerCoverPicKey: true,
          biggerCoverPicKey: true,
        },
        include: {
          statistics: true,
          genres: {
            include: {
              genre: { select: { name: true } },
            },
          },
          comments: true,
          isbns: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting short and sweet books.',
      );
    }
  }

  /**
   * @summary Retrieves books that are suitable for "Weekend Reads" based on their page number, limited to those with 250 pages or fewer. The method includes related data such as statistics, comments, and genres for each book.
   *  @description This method fetches books that are categorized as "Weekend Reads" by filtering them based on their page number, specifically those that have 250 pages or fewer. It limits the results to entries that meet this criterion and includes related information such as statistics (e.g., average rating, rating count), comments from users, and associated genres with their names. The method ensures that only approved books are retrieved and that the results are filtered to highlight reads that can be comfortably enjoyed over a weekend.
   *  @returns A promise resolving to an array of "Weekend Reads" books, each including its statistics, comments, and genres.
   */
  async getWeekendReads(take: number = 15) {
    try {
      return await this.prisma.book.findMany({
        where: {
          AND: [{ approveStatus: true }, { pageNumber: { lte: 250 } }],
        },
        take: take,
        omit: {
          smallerCoverPicKey: true,
          biggerCoverPicKey: true,
        },
        include: {
          statistics: true,
          genres: {
            include: {
              genre: { select: { name: true } },
            },
          },
          comments: true,
          isbns: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting weekend reads books.',
      );
    }
  }

  /**
   * @summary Retrieves a spotlight section for a random genre, including a title, subtitle, and a list of handpicked essential books for that genre. The method randomly selects a genre from a predefined list and fetches books that fit the criteria for that genre, including related data such as statistics, comments, and genres for each book.
   * @description This method creates a spotlight section for a randomly selected genre by first choosing a genre from a predefined list of genres. It then constructs a title and subtitle for the spotlight section based on the selected genre. The method fetches books that are relevant to the chosen genre using specific criteria defined in the `getBooksByASpecificGenre` helper method. Each book in the spotlight section includes related information such as statistics (e.g., average rating, rating count), comments from users, and associated genres with their names. The method ensures that only approved books are retrieved and that the results are tailored to highlight essential reads for fans of the selected genre.
   *  @param take The number of books to retrieve.
   *  @returns A promise resolving to an object containing the title, subtitle, and a list of books for the genre spotlight section. The books included in this section are handpicked essentials for lovers of the randomly selected genre, and each book includes its statistics, comments, and genres.
   */
  async getGenreSpotlight(take: number = 15) {
    const randomGenre = this.getRandomGenre();
    const forProd =
      randomGenre.charAt(0).toUpperCase() +
      randomGenre
        .slice(1)
        .replace(/-\w/, (match) => ' ' + match[1].toUpperCase());
    return {
      title: `Genre Spotlights: ${forProd}`,
      subtitle: `Handpicked essentials for every ${forProd} lover.`,
      data: await this.getBooksByASpecificGenre(randomGenre as GenreType, take),
    };
  }

  /**
   * @summary Returns a random genre from a predefined list.
   * @description This method selects a genre at random from a list of available genres.
   * @returns The name of the randomly selected genre.
   */
  getRandomGenre() {
    const GENRE_LIST = [
      'history',
      'fiction',
      'romance',
      'young-adult',
      'fantasy',
      'just-science',
      'thriller',
      'social-science',
    ];
    const randomIndex = Math.floor(Math.random() * GENRE_LIST.length);
    return GENRE_LIST[randomIndex];
  }

  /**
   * @summary Retrieves books that fit the criteria for a specific genre based on predefined keyword filters. The method constructs a query to fetch approved books that match the keywords associated with the specified genre, while also allowing for the exclusion of certain keywords if necessary. The results include related data such as statistics, comments, genres, and ISBNs for each book.
   * @description This method defines a set of keyword filters for each genre and constructs a query to retrieve books that match the criteria for the specified genre. It includes conditions to ensure that only approved books are fetched and allows for the inclusion of books that contain certain keywords in their genres while excluding others if specified. The method returns a list of books that fit the genre criteria, along with related information such as statistics (e.g., average rating, rating count), comments from users, associated genres with their names, and ISBNs.
   * @param genre The genre for which to retrieve books. The genre is used to determine the relevant keywords for filtering the books in the database query.
   * @param take The number of books to retrieve.
   * @returns A list of books that fit the genre criteria, along with related information. Each book includes its statistics, comments, genres, and ISBNs.
   * @throws {@link InternalServerErrorException} if an error occurs while fetching the books for the specified genre. The method includes error handling to ensure that any issues encountered during the database query process are properly logged and managed, allowing the application to gracefully handle errors and provide informative feedback to the client.
   */
  async getBooksByASpecificGenre(genre: GenreType, take: number = 15) {
    const genreFilters: Record<GenreType, any> = {
      history: { keywords: ['history'] },
      fiction: { keywords: ['fiction'] },
      romance: { keywords: ['romance', 'love'] },
      'young-adult': { keywords: ['adult'] },
      fantasy: { keywords: ['magic', 'fantasy'] },
      thriller: { keywords: ['thriller', 'horror'] },
      'social-science': { keywords: ['economics', 'politic', 'business'] },
      'just-science': { keywords: ['science'], exclude: ['fiction'] },
    };

    const config = genreFilters[genre];

    const where: any = {
      approveStatus: true,
      AND: [],
    };

    const keywordQuery = {
      OR: config.keywords.map((kw) => ({
        genres: {
          some: { genre: { name: { contains: kw, mode: 'insensitive' } } },
        },
      })),
    };
    where.AND.push(keywordQuery);

    if (config.exclude) {
      where.AND.push({
        NOT: config.exclude.map((ex) => ({
          genres: {
            some: { genre: { name: { contains: ex, mode: 'insensitive' } } },
          },
        })),
      });
    }

    try {
      return await this.prisma.book.findMany({
        where,
        take: take,
        include: {
          statistics: true,
          genres: { include: { genre: { select: { name: true } } } },
          comments: true,
          isbns: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting books by a specific genre.',
      );
    }
  }

  /**
   * @summary Retrieves books that have multiple editions, indicating their popularity and longevity. The method fetches approved books and orders them by the count of their associated ISBNs in descending order, limited to the top 15 entries. Each book includes related data such as statistics, comments, genres, and ISBNs.
   * @description This method identifies books that have multiple editions by counting the number of associated ISBNs for each book. It retrieves approved books from the database and orders them based on the count of their ISBNs in descending order, which serves as an indicator of their popularity and longevity. The method limits the results to the top 15 entries and includes related information such as statistics (e.g., average rating, rating count), comments from users, associated genres with their names, and ISBNs for each book. This allows users to discover books that have been reprinted or have multiple editions, suggesting that they are well-loved and have stood the test of time.
   * @param take The number of books to retrieve.
   * @returns A list of books that have multiple editions, along with related information. Each book includes its statistics, comments, genres, and ISBNs.
   */
  async getMultiEditionHits(take: number = 15) {
    try {
      return await this.prisma.book.findMany({
        where: {
          approveStatus: true,
        },
        orderBy: {
          isbns: {
            _count: 'desc',
          },
        },
        take: take,
        include: {
          statistics: true,
          genres: { include: { genre: { select: { name: true } } } },
          comments: true,
          isbns: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting multi-edition hits books.',
      );
    }
  }

  /**
   * @summary Retrieves classic books that have stood the test of time, based on their original publication year. The method fetches approved books that were originally published before the year 2000, limited to the top 15 entries. Each book includes related data such as statistics, comments, genres, and ISBNs.
   * @description This method identifies "Oldies but Goldies" by filtering books based on their original publication year, specifically those that were published before the year 2000. It retrieves approved books from the database that meet this criterion and limits the results to the top 15 entries. Each book in this category includes related information such as statistics (e.g., average rating, rating count), comments from users, associated genres with their names, and ISBNs. This allows users to discover classic books that have been cherished over time and have made a lasting impact on readers.
   * @param take The number of books to retrieve.
   * @returns A list of classic books that have stood the test of time, along with related information. Each book includes its statistics, comments, genres, and ISBNs.
   */
  async getOldiesButGoldies(take: number = 15) {
    try {
      return await this.prisma.book.findMany({
        where: {
          AND: [
            { approveStatus: true },
            { originalPublicationYear: { lt: 2000 } },
          ],
        },
        take: take,
        include: {
          statistics: true,
          genres: { include: { genre: { select: { name: true } } } },
          comments: true,
          isbns: true,
          author: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting oldies but goldies books.',
      );
    }
  }
}
