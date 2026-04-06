import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import type { UploadedFile } from 'src/common/types/types';
import { S3Service } from 'src/s3/s3.service';
import { PrismaService } from 'src/prisma.service';
import { GenresService } from 'src/genres/genres.service';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from './dto/pagination.dto';
import { title } from 'process';
import { GenreType } from 'src/books/books.service';
import { get } from 'axios';

@Injectable()
export class AuthorsService {
  private readonly logger = new Logger(AuthorsService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
    private readonly genresService: GenresService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * @summary Retrieves the list of authors that the user has in their collection (i.e., authors that the user has favorited). It queries the database for authors that are favorited by the specified user ID.
   * @description This method is used to get the list of authors that a user has in their collection, which is determined by the authors they have favorited. It performs a database query to find all authors where there is a relation in the favoritedBy table that matches the provided user ID. The result is a list of authors that the user has added to their collection.
   * @param userId The ID of the user for whom to retrieve the collection of favorited authors.
   * @returns A list of authors that the user has added to their collection.
   * @throws InternalServerErrorException if there is an error during the database query to retrieve the authors.
   */
  async getMyCollectionsAuthorsContent(userId: string) {
    try {
      return await this.prisma.author.findMany({
        where: { favoritedBy: { some: { userId } } },
      });
    } catch (error) {
      this.logger.error(`Error fetching author content: ${error.message}`);
      throw new InternalServerErrorException('Error fetching author content');
    }
  }

  /**
   * @summary Searches for authors in external APIs (currently Open Library) based on the provided name. This is used to help auto-fill author details and prevent duplicates when creating new authors.
   * @description Searches for authors in external APIs (currently Open Library) based on the provided name. This is used to help auto-fill author details and prevent duplicates when creating new authors.
   * @param name the author name (we search with it in external APIs such as Google Book API or Open Library)
   * @returns Authors matching the name from external APIs. We use this for auto-fill and to avoid duplicates when creating new authors.
   */
  async searchExternal(name: string) {
    try {
      const url = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(name)}`;
      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data.docs || data.docs.length === 0) return [];
      const results = await Promise.all(
        data.docs.slice(0, 5).map(async (author) => {
          return {
            openLibraryId: author.key,
            name: author.name,
            birthDate: author.birth_date || null,
            subjects: author.top_subjects || null,
            top_works: author.top_work || null,
          };
        }),
      );

      return results;
    } catch (error) {
      this.logger.error(`Error during OL search: ${error.message}`);
      return [];
    }
  }

  /**
   * @summary Creates a new author in the database. It checks for duplicates based on Open Library ID and a soft match of name, birth date
   * @description Creates a new author in the database. It checks for duplicates based on Open Library ID and a soft match of name
   * @param file this is a picture file that we need here for author avatar if you dont provide one we fill it with a default avatar.
   * @param createAuthorDto the data transfer object containing author details to create
   * @returns the created author entity
   * @throws ConflictException if an author with the same Open Library ID already exists or if a soft match duplicate is found based on name, birth date, and nationality
   * @throws InternalServerErrorException if there is an error during image upload or database save, with rollback of uploaded images if the database save fails
   */
  async create(file: UploadedFile | null, createAuthorDto: CreateAuthorDto) {
    if (createAuthorDto.openLibraryId) {
      const existingAuthor = await this.prisma.author.findUnique({
        where: { openLibraryId: createAuthorDto.openLibraryId },
      });

      if (existingAuthor) {
        throw new ConflictException(
          'This author already exists in the database.',
        );
      }
    }

    // Check for duplicate author
    const duplicateAuthor = await this.prisma.author.findFirst({
      where: {
        name: { equals: createAuthorDto.name, mode: 'insensitive' },
        birthDate: createAuthorDto.birthDate ? createAuthorDto.birthDate : null,
        nationality: createAuthorDto.nationality
          ? { equals: createAuthorDto.nationality, mode: 'insensitive' }
          : null,
      },
    });
    if (duplicateAuthor) {
      throw new ConflictException(
        `The author (${createAuthorDto.name}) already exists with the provided details.`,
      );
    }

    let s3Result;
    if (file) {
      try {
        s3Result = await this.s3Service.uploadImage(
          file,
          'author',
          createAuthorDto.name,
        );
      } catch (error) {
        throw new InternalServerErrorException(
          'Error occurred during image upload.',
        );
      }
    } else {
      // No file uploaded, use default images
      s3Result = {
        small: 'http://localhost:4566/author-images/author-default.png',
        large: 'http://localhost:4566/author-images/author-default.png',
        keys: [null, null],
      };
    }
    try {
      return await this.prisma.author.create({
        data: {
          ...createAuthorDto,
          approveStatus: false,
          smallerProfilePic: s3Result.small,
          biggerProfilePic: s3Result.large,
          smallerProfilePicKey: s3Result.keys[0],
          biggerProfilePicKey: s3Result.keys[1],
        },
      });
    } catch (error) {
      // Rollback, delete uploaded images if DB save fails
      if (s3Result.keys.some((k) => k !== null)) {
        await this.s3Service.deleteImages(
          'author',
          s3Result.keys.filter((k) => k !== null),
        );
      }
      throw new InternalServerErrorException('Database error during save.');
    }
  }

  /**
   * @summary Retrieves a paginated list of authors with optional filtering and sorting. Admins can see unapproved authors, while regular users only see approved ones. Supports searching by name and sorting by name, creation date, number of favorites, or average rating.
   * @description Retrieves a paginated list of authors from the database. Supports filtering by approval status, search term, and sorting by various fields including name, creation date, number of favorites, and average rating.
   * @param query the pagination and filtering options
   * @param admin a boolean indicating if the request is from an admin (to filter by approval status)
   * @param currentUserId the ID of the currently logged-in user
   * @remarks Sorting by average rating is implemented in-memory after fetching the relevant authors and their books, due to limitations in Prisma's ability to sort by related model aggregates that calculate averages.
   * @returns a paginated list of authors with metadata
   * @throws InternalServerErrorException if there is a database error during retrieval
   */
  async findAll(query: PaginationDto, admin: boolean, currentUserId: string) {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    if (!admin) {
      whereCondition.approveStatus = true;
    }

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { nationality: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = {};

    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'createdAt':
        orderBy = { createdAt: sortOrder };
        break;
      case 'favorites':
        orderBy = { favoritedBy: { _count: sortOrder } };
        break;
      case 'rating':
        return this.findAllSortedByRating(
          whereCondition,
          skip,
          limit,
          sortOrder,
          currentUserId,
        );
      default:
        orderBy = { name: 'asc' };
    }

    try {
      const [data, total] = await Promise.all([
        this.prisma.author.findMany({
          where: whereCondition,
          skip: skip,
          take: limit,
          orderBy,
          include: {
            _count: {
              select: { favoritedBy: true, books: true },
            },
            favoritedBy: {
              where: { userId: currentUserId },
            },
          },
        }),
        this.prisma.author.count({ where: whereCondition }),
      ]);

      const mappedData = data.map((author) => {
        const { favoritedBy, ...rest } = author;
        return {
          ...rest,
          isFavorited: favoritedBy.length > 0 ? true : false,
        };
      });

      return {
        data: mappedData,
        meta: { total, page, lastPage: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new InternalServerErrorException('Database error during get All.');
    }
  }

  /**
   * @summary This method retrieves authors sorted by their average book ratings. Since Prisma does not support sorting by related model aggregates in a way that calculates averages, we fetch the relevant authors and their books, calculate the average ratings in memory, and then sort the results before paginating.
   * @description This method is used when the client requests authors sorted by their average ratings. It first retrieves all authors matching the provided conditions along with their books and the average ratings of those books. Then, it calculates the average rating for each author, sorts the authors based on these averages, and finally returns the paginated result.
   * @param where where statement to filter authors (e.g., by approval status, search term)
   * @param skip skip for pagination
   * @param take take for pagination
   * @param order order of sorting (asc or desc)
   * @param currentUserId the ID of the currently logged-in user, used to determine if each author is favorited by the current user
   * @returns a paginated list of authors with metadata, sorted by average rating
   * @throws {InternalServerErrorException} if there is a database error during retrieval
   */
  private async findAllSortedByRating(
    where: any,
    skip: number,
    take: number,
    order: 'asc' | 'desc',
    currentUserId: string,
  ) {
    let authors;
    // all authors matching the where condition
    try {
      authors = await this.prisma.author.findMany({
        where,
        include: {
          books: {
            select: {
              statistics: { select: { averageRating: true } },
            },
          },
          _count: { select: { favoritedBy: true } },
          favoritedBy: {
            where: { userId: currentUserId },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Database error during get All by rating.',
      );
    }

    // we calculate average ratings and sort manually
    const sortedData = authors
      .map((author) => {
        const ratings = author.books
          .map((b) => b.statistics?.averageRating || 0)
          .filter((r) => r > 0);
        const avg =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        return { ...author, averageRating: avg };
      })
      .sort((a, b) =>
        order === 'desc'
          ? b.averageRating - a.averageRating
          : a.averageRating - b.averageRating,
      );

    const total = await this.prisma.author.count({ where });

    return {
      data: sortedData.slice(skip, skip + take),
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        lastPage: Math.ceil(total / take),
      },
    };
  }

  /**
   *
   * @summary Retrieves a single author by their ID. If the author does not exist, a NotFoundException is thrown.
   * @description This method retrieves a single author from the database using their unique ID. It includes related data such as the count of users who have favorited the author, whether the current user has favorited them, and their books with associated statistics and genres. If no author is found with the provided ID, a NotFoundException is thrown to indicate that the requested resource does not exist.
   * @remarks The method also checks if the current user has favorited the author and includes this information in the response, allowing the frontend to display the appropriate UI state for favoriting.
   * @param id This is the Author Id.
   * @param userId This is the ID of the current user. It is used to determine if the author is favorited by the current user, which allows the frontend to display the correct state for favoriting (e.g., filled heart icon if favorited).
   * @returns An instance of an author.
   * @throws NotFoundException if the author with the given ID does not exist in the database.
   */
  async findOne(id: string, userId: string) {
    try {
      const author = await this.prisma.author.findUniqueOrThrow({
        where: { id },
        include: {
          _count: {
            select: { favoritedBy: true },
          },
          favoritedBy: {
            where: { userId },
          },
          books: {
            include: {
              statistics: true,
              genres: {
                select: {
                  genre: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      const isFavoritedbyCurrentUser = author.favoritedBy.length > 0;

      const { favoritedBy, ...rest } = author;

      return {
        ...rest,
        isFavoritedbyCurrentUser,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Author not found.');
      }
      throw new InternalServerErrorException(
        'Database error during find one Author.',
      );
    }
  }

  /**
   * @summary Updates an existing author's details. It checks for the existence of the author, validates uniqueness of the Open Library ID if it's being changed, and also checks for soft duplicates based on name, birth date, and nationality.
   * @description Updates an existing author's details. It first checks if the author exists, then if the Open Library ID is being changed, it validates that the new ID is unique. It also performs a soft duplicate check if the name, birth date, or nationality are being changed. If a new profile picture is provided, it uploads the new image to S3 and deletes the old one. Finally, it updates the author record in the database with the new details and image URLs.
   * @param id This is an ID of an author what you want to update.
   * @param file This is for uploading a new profile picture for the author. If null is provided, the existing picture will remain unchanged.
   * @param updateAuthorDto This contains the updated author data.
   * @returns The updated author instance.
   * @throws NotFoundException if the author with the given ID does not exist in the database.
   * @throws ConflictException if the new Open Library ID (if provided) already exists for another author, or if a soft match duplicate is found based on name, birth date
   */
  async update(
    id: string,
    file: UploadedFile | null,
    updateAuthorDto: UpdateAuthorDto,
  ) {
    // Author existence check
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException('Author not found.');

    // If Open Library ID is being changed, check uniqueness
    if (
      updateAuthorDto.openLibraryId &&
      updateAuthorDto.openLibraryId !== author.openLibraryId
    ) {
      const idConflict = await this.prisma.author.findUnique({
        where: { openLibraryId: updateAuthorDto.openLibraryId },
      });

      if (idConflict) {
        throw new ConflictException(
          'This Open Library ID already belongs to another author.',
        );
      }
    }

    // If name, birthDate, or nationality are being changed (Soft match check on update)
    if (
      updateAuthorDto.name ||
      updateAuthorDto.birthDate ||
      updateAuthorDto.nationality
    ) {
      const duplicateMatch = await this.prisma.author.findFirst({
        where: {
          id: { not: id }, // Ne önmagát találja meg!
          name: {
            equals: updateAuthorDto.name || author.name,
            mode: 'insensitive',
          },
          birthDate:
            updateAuthorDto.birthDate !== undefined
              ? updateAuthorDto.birthDate
              : author.birthDate,
          nationality:
            updateAuthorDto.nationality !== undefined
              ? updateAuthorDto.nationality
                ? { equals: updateAuthorDto.nationality, mode: 'insensitive' }
                : null
              : author.nationality
                ? { equals: author.nationality, mode: 'insensitive' }
                : null,
        },
      });

      if (duplicateMatch) {
        throw new ConflictException(
          'Another author with these details already exists.',
        );
      }
    }

    // Image handling (S3)
    let s3Result: {
      small: string;
      large: string;
      keys: (string | null)[];
    } | null = null;
    if (file) {
      try {
        s3Result = await this.s3Service.uploadImage(
          file,
          'author',
          updateAuthorDto.name || author.name,
        );
      } catch (error) {
        throw new InternalServerErrorException(
          'Error occurred during image upload.(update)',
        );
      }

      const keysToDelete = [
        author.smallerProfilePicKey,
        author.biggerProfilePicKey,
      ].filter((k) => k !== null);
      if (keysToDelete.length > 0) {
        await this.s3Service
          .deleteImages('author', keysToDelete)
          .catch((err) =>
            this.logger.error(`S3 deletion error: ${err.message}`),
          );
      }
    }

    // Save
    try {
      return await this.prisma.author.update({
        where: { id },
        data: {
          ...updateAuthorDto,
          ...(s3Result && {
            smallerProfilePic: s3Result.small,
            biggerProfilePic: s3Result.large,
            smallerProfilePicKey: s3Result.keys[0],
            biggerProfilePicKey: s3Result.keys[1],
          }),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Database error during update.');
    }
  }

  /**
   * @summary Deletes an author by their Open Library ID. It first finds the author using the provided Open Library ID, then deletes any associated images from S3, and finally removes the author record from the database. If the author has books assigned to them, a ConflictException is thrown.
   * @description Deletes an author by their Open Library ID. The method first attempts to find the author using the provided Open Library ID. If the author is found, it proceeds to delete any associated profile images from S3. After handling the images, it attempts to delete the author record from the database. If the author has books assigned to them, a ConflictException is thrown to prevent deletion.
   * @param olId The Open Library ID of the author to be deleted.
   * @returns The deleted author instance.
   * @throws NotFoundException if there is no author with the given Open Library ID.
   * @throws ConflictException if the author cannot be deleted because there are books assigned to them.
   */
  async removeByOpenLibraryId(olId: string) {
    // Find author by Open Library ID
    const author = await this.prisma.author.findUnique({
      where: { openLibraryId: olId },
    });

    if (!author) {
      throw new NotFoundException(
        `There is no author with this Open Library ID: ${olId}`,
      );
    }

    return await this.remove(author.id);
  }

  async remove(id: string) {
    //Find the author to check if they have images on S3
    const author = await this.prisma.author.findUnique({
      where: { id },
    });

    if (!author) {
      throw new NotFoundException('Author not found.');
    }

    // S3 image delete
    const keysToDelete = [
      author.smallerProfilePicKey,
      author.biggerProfilePicKey,
    ].filter((key): key is string => key !== null);

    if (keysToDelete.length > 0) {
      try {
        await this.s3Service.deleteImages('author', keysToDelete);
        this.logger.log(`S3 images deleted for author: ${id}`);
      } catch (error) {
        this.logger.error(
          `Error occurred while deleting S3 images: ${error.message}`,
        );
      }
    }

    //Delete from database
    try {
      return await this.prisma.author.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting from database: ${error.message}`);
      if (error.code === 'P2003') {
        throw new ConflictException(
          'The author cannot be deleted because there are books assigned to them.',
        );
      }
      throw error;
    }
  }

  /**
   * @summary Approves an author by setting their approveStatus to true. This method is typically used by admins to approve authors that are pending moderation. It first checks if the author exists, and if so, updates their approveStatus to true. If the author does not exist, a NotFoundException is thrown.
   * @description Approves an author by setting their approveStatus to true. This method is used in the moderation process where admins can approve authors that are pending. The method first checks if the author with the given ID exists in the database. If the author is found, it updates their approveStatus field to true, effectively approving them. If the author does not exist, a NotFoundException is thrown to indicate that the specified author cannot be found.
   * @param id The ID of the author to approve.
   * @returns The updated author instance with approveStatus set to true.
   * @throws NotFoundException if the author with the given ID does not exist in the database.
   * @throws InternalServerErrorException if there is an error during the database update operation.
   */
  async approve(id: string) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException('Author not found.');
    try {
      return await this.prisma.author.update({
        where: { id },
        data: { approveStatus: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred during approval (author).',
      );
    }
  }

  /**
   * @summary Disapproves an author by setting their approveStatus to false. This method is typically used by admins to disapprove authors that are pending moderation or to revoke approval from previously approved authors. It first checks if the author exists, and if so, updates their approveStatus to false. If the author does not exist, a NotFoundException is thrown.
   * @description Disapproves an author by setting their approveStatus to false. This method is used in the moderation process where admins can disapprove authors that are pending or revoke approval from previously approved authors. The method first checks if the author with the given ID exists in the database. If the author is found, it updates their approveStatus field to false, effectively disapproving them. If the author does not exist, a NotFoundException is thrown to indicate that the specified author cannot be found.
   * @param id The ID of the author to disapprove.
   * @returns The updated author instance with approveStatus set to false.
   * @throws NotFoundException if the author with the given ID does not exist in the database.
   * @throws InternalServerErrorException if there is an error during the database update operation.
   */
  async disapprove(id: string) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException('Author not found.');

    try {
      return await this.prisma.author.update({
        where: { id },
        data: { approveStatus: false },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred during disapproval (author).',
      );
    }
  }

  /**
   * @summary Retrieves various statistics for authors that are pending moderation. This includes counts of pending and approved authors, data quality metrics such as how many have biographies or profile pictures, and the top 5 most popular authors based on the number of times they have been favorited.
   * @description This method is used to gather statistics for authors that are pending moderation. It retrieves the count of authors awaiting moderation (approveStatus: false), the count of approved authors (approveStatus: true), data quality metrics such as how many authors have a biography and how many have a unique profile picture, and also identifies the top 5 most popular authors based on the number of times they have been favorited by users. The results are returned in a structured format that includes moderation stats, data quality metrics, and the list of top authors.
   * @returns An object containing moderation statistics, data quality metrics, and the top 5 most popular authors.
   * @throws InternalServerErrorException if there is an error during the database queries to retrieve the statistics.
   */
  async getModerationAuthorStats() {
    const [pending, approved, totalWithBio, totalWithPic, topAuthors] =
      await Promise.all([
        // Authors awaiting moderation
        this.prisma.author.count({ where: { approveStatus: false } }),

        // Active authors count
        this.prisma.author.count({ where: { approveStatus: true } }),

        // Data quality: has a biography
        this.prisma.author.count({ where: { bio: { not: null } } }),

        // Data quality: has a unique profile picture (not the default)
        this.prisma.author.count({
          where: { smallerProfilePicKey: { not: null } },
        }),

        // Top 5 most popular (based on favorites)
        this.prisma.author.findMany({
          select: {
            name: true,
            _count: { select: { favoritedBy: true } },
          },
          orderBy: { favoritedBy: { _count: 'desc' } },
          take: 5,
        }),
      ]);

    return {
      moderation: { pending, approved },
      dataQuality: { totalWithBio, totalWithPic },
      topAuthors,
    };
  }

  /**
   * @summary Finds authors similar to a given author based on shared subjects. It retrieves the target author, extracts their subjects, and then finds other authors who have overlapping subjects. The results are filtered to include only those with a minimum number of shared subjects and are sorted by the count of common subjects in descending order.
   * @description This method is used to find authors that are similar to a specified author based on the subjects associated with them. It first retrieves the target author using their ID and extracts their subjects into an array. Then, it queries the database for other authors who have any overlapping subjects with the target author. The results are processed to count how many subjects they have in common with the target author, and only those with a minimum number of shared subjects (default is 2) are included in the final result. The similar authors are then sorted by the count of common subjects in descending order, and the top 10 results are returned.
   * @param authorId This is the ID of the author for whom we want to find similar authors based on shared subjects.
   * @param minCommon The minimum number of common subjects required for an author to be considered similar.
   * @returns An array of authors similar to the specified author, each with a count of common subjects.
   * @throws NotFoundException if the author with the given ID does not exist in the database.
   * @throws InternalServerErrorException if there is an error during the database queries to retrieve the authors and their subjects.
   */
  async findSimilarBySubject(authorId: string, minCommon: number = 2) {
    let target;
    try {
      target = await this.prisma.author.findUniqueOrThrow({
        where: { id: authorId },
      });
    } catch (error) {
      throw new NotFoundException('Author not found for similarity search.');
    }

    const targetArray = target.subjects
      .split(',')
      .map((s) => s.trim().toLowerCase());

    // 1. Fetch everyone who has ANY overlap (broad catch)
    const candidates = await this.prisma.author.findMany({
      where: {
        id: { not: authorId },
        approveStatus: true,
        OR: targetArray.map((term) => ({
          subjects: { contains: term, mode: 'insensitive' },
        })),
      },
    });

    // Filter how many subjects match and sort by that
    return candidates
      .map((author) => {
        const authorSubs =
          author.subjects?.split(',').map((s) => s.trim().toLowerCase()) || [];
        const commonCount = authorSubs.filter((s) =>
          targetArray.includes(s),
        ).length;
        return { ...author, commonCount };
      })
      .filter((author) => author.commonCount >= minCommon)
      .sort((a, b) => b.commonCount - a.commonCount)
      .slice(0, 10);
  }

  /**
   * @summary Finds authors similar to a given author based on shared genres. It retrieves the target author, extracts their genres from their books, and then finds other authors who have overlapping genres. The results are filtered to include only those with a minimum number of shared genres and are sorted by the count of common genres in descending order.
   * @description This method is used to find authors that are similar to a specified author based on the genres associated with their books. It first retrieves the target author using their ID. Then, it queries the database for the genres of the target author's books and extracts unique genre IDs. Next, it finds other authors who have books in these genres. The results are processed to count how many genres they have in common with the target author, and only those with a minimum number of shared genres (default is 2) are included in the final result. The similar authors are then sorted by the count of common genres in descending order, and the top 10 results are returned.
   * @param authorId This is the ID of the author for whom we want to find similar authors based on shared genres.
   * @param minCommonGenres The minimum number of common genres required for an author to be considered similar.
   * @returns An array of authors similar to the specified author, each with a count of common genres.
   * @throws NotFoundException if the author with the given ID does not exist in the database.
   * @throws InternalServerErrorException if there is an error during the database queries to retrieve the authors and their genres.
   */
  async findSimilarByGenres(authorId: string, minCommonGenres: number = 2) {
    try {
      const author = await this.prisma.author.findUniqueOrThrow({
        where: { id: authorId },
      });
    } catch (error) {
      throw new NotFoundException('Author not found for similarity search.');
    }
    // Get genre IDs of the target author
    const authorGenres = await this.prisma.bookGenres.findMany({
      where: {
        book: { authorId: authorId },
      },
      select: { genreId: true },
    });

    // Extract unique genre IDs
    const genreIds = [...new Set(authorGenres.map((g) => g.genreId))];

    if (genreIds.length === 0) return [];

    // Find other authors who have books in these genres
    const candidates = await this.prisma.author.findMany({
      where: {
        id: { not: authorId },
        approveStatus: true,
        books: {
          some: {
            genres: {
              some: {
                genreId: { in: genreIds },
              },
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            books: {
              where: {
                genres: {
                  some: { genreId: { in: genreIds } },
                },
              },
            },
          },
        },
      },
      take: 50,
    });

    // Minimal common genres
    const result = await Promise.all(
      candidates.map(async (author) => {
        // How many unique genres does this author have in common?
        const rawGenres = await this.prisma.bookGenres.findMany({
          where: {
            book: { authorId: author.id },
            genreId: { in: genreIds },
          },
          select: { genreId: true },
        });

        const commonCount = [...new Set(rawGenres.map((g) => g.genreId))]
          .length;

        return {
          ...author,
          commonCount,
        };
      }),
    );

    return result
      .filter((a) => a.commonCount >= minCommonGenres)
      .sort((a, b) => b.commonCount - a.commonCount)
      .slice(0, 10);
  }

  /**
   * @summary Retrieves authors to be displayed on the main page, categorized into sections such as "Newly Added", "Modern Visionaries", and "Masterminds Behind the Hits". Each section includes a title, subtitle, and a list of authors that fit the criteria for that category.
   * @description This method is used to gather authors for the main page display. It categorizes authors into three sections: "Newly Added" for the most recently added authors, "Modern Visionaries" for influential contemporary authors (born after 1970), and "Masterminds Behind the Hits" for authors of highly-rated books (average rating of 4 or higher). Each section includes a title, a subtitle describing the category, and a list of authors that meet the criteria. The method returns an array of these sections to be rendered on the main page.
   * @returns An array of objects, each representing a section of authors for the main page, including the title, subtitle, and the list of authors in that section.
   * @throws InternalServerErrorException if there is an error during the database queries to retrieve the authors for any of the sections.
   */
  async getMainPageAuthors() {
    const newlyAdded = await this.getNewlyAddedAuthors();
    const modernVisionaries = await this.getModernVisionaries();
    const topBooksAuthors = await this.getTopBooksAuthors();
    const mainPageAuthors = [
      {
        title: 'Freshly Picked Talents',
        subtitle: 'Explore the newest storytellers in our collection.',
        data: newlyAdded,
      },
      {
        title: 'Modern Visionaries',
        subtitle:
          'Fresh perspectives from the most influential writers of our time.',
        data: modernVisionaries,
      },
      {
        title: 'Masterminds Behind the Hits',
        subtitle: 'Meet the brilliant authors of our most highly-rated books.',
        data: topBooksAuthors,
      },
    ];
    return mainPageAuthors;
  }

  /**
   * @summary Retrieves the most recently added authors that have been approved. This method is used to populate the "Newly Added" section on the main page, showcasing the latest additions to the author collection. It fetches authors from the database where approveStatus is true, orders them by their creation date in descending order, and limits the results to the 15 most recent authors. Additionally, it omits the profile picture keys from the returned data for security and privacy reasons.
   * @description This method is responsible for fetching the most recently added authors that have been approved for display. It queries the database for authors with approveStatus set to true, sorts them by their createdAt timestamp in descending order to get the newest authors first, and limits the results to 15 authors. The method also omits the smallerProfilePicKey and biggerProfilePicKey fields from the returned author data to prevent exposure of sensitive information related to image storage.
   * @returns A promise resolving to an array of the most recently added and approved authors.
   */
  async getNewlyAddedAuthors() {
    try {
      return await this.prisma.author.findMany({
        where: { approveStatus: true },
        orderBy: { createdAt: 'desc' },
        take: 15,
        omit: {
          smallerProfilePicKey: true,
          biggerProfilePicKey: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting newly added authors.',
      );
    }
  }

  /**
   * @summary Retrieves influential contemporary authors born after January 1, 1970, that have been approved. This method is used to populate the "Modern Visionaries" section on the main page, highlighting influential authors of our time. It fetches authors from the database where approveStatus is true and birthDate is greater than or equal to January 1, 1970. The results are ordered by their creation date in descending order and limited to the 15 most recent authors. Similar to other methods, it omits the profile picture keys from the returned data for security and privacy reasons.
   * @description This method is responsible for fetching influential contemporary authors who were born after January 1, 1970, and have been approved for display. It queries the database for authors with approveStatus set to true and a birthDate that is greater than or equal to January 1, 1970. The results are sorted by their createdAt timestamp in descending order to prioritize newer authors, and the output is limited to 15 authors. The method also omits the smallerProfilePicKey and biggerProfilePicKey fields from the returned author data to ensure that sensitive information related to image storage is not exposed.
   * @returns A promise resolving to an array of influential contemporary authors.
   */
  async getModernVisionaries() {
    try {
      return await this.prisma.author.findMany({
        where: {
          approveStatus: true,
          birthDate: { gte: new Date('1970-01-01') },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
        omit: {
          smallerProfilePicKey: true,
          biggerProfilePicKey: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting modern visionaries.',
      );
    }
  }

  /**
   * @summary Retrieves authors of highly-rated books (average rating of 4 or higher) that have been approved. This method is used to populate the "Masterminds Behind the Hits" section on the main page, showcasing authors whose books have received high ratings from readers. It queries the database for authors with approveStatus set to true and who have at least one book with an average rating of 4 or higher. The results are limited to 15 authors and omit the profile picture keys for security and privacy reasons.
   * @description This method is responsible for fetching authors whose books have received high ratings (average rating of 4 or higher) and have been approved for display. It queries the database for authors with approveStatus set to true and a related condition that checks if they have at least one book with a statistics record where averageRating is greater than or equal to 4. The results are limited to 15 authors, and the smallerProfilePicKey and biggerProfilePicKey fields are omitted from the returned data to prevent exposure of sensitive information related to image storage.
   * @returns A promise resolving to an array of top books authors.
   */
  async getTopBooksAuthors() {
    try {
      const authors = await this.prisma.author.findMany({
        where: {
          approveStatus: true,
          books: { some: { statistics: { averageRating: { gte: 4 } } } },
        },
        take: 15,
        omit: {
          smallerProfilePicKey: true,
          biggerProfilePicKey: true,
        },
        distinct: ['id'],
      });
      return authors;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting top books authors.',
      );
    }
  }

  /**
   * @summary Retrieves a random selection of approved authors. This method is used to provide a diverse and dynamic set of authors for features such as "Discover Random Authors". It first counts the total number of approved authors in the database, then generates a random index to skip a random number of records, and finally retrieves a specified number of authors starting from that random index. The profile picture keys are omitted from the returned data for security and privacy reasons.
   * @description This method retrieves a random selection of authors that have been approved. It begins by counting the total number of authors with approveStatus set to true. If there are no approved authors, it returns an empty array. Otherwise, it generates a random index to skip a random number of records and retrieves a specified number of authors (default is 15) starting from that index. The method also omits the smallerProfilePicKey and biggerProfilePicKey fields from the returned author data to ensure that sensitive information related to image storage is not exposed.
   * @param take The number of authors to retrieve. Defaults to 15 if not specified.
   * @returns A promise resolving to an array of randomly selected approved authors.
   * @throws InternalServerErrorException if there is an error during the database queries to count the authors or retrieve the random selection.
   */
  async getRandomAuthors(take: number = 15) {
    try {
      const totalAuthors = await this.prisma.author.count({
        where: { approveStatus: true },
      });

      if (totalAuthors === 0) {
        return [];
      }

      const randomIndex = Math.floor(Math.random() * totalAuthors);
      const authors = await this.prisma.author.findMany({
        where: { approveStatus: true },
        skip: randomIndex,
        take,
        omit: {
          smallerProfilePicKey: true,
          biggerProfilePicKey: true,
        },
      });

      return authors;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error during getting random authors.',
      );
    }
  }

  /**
   * @summary Retrieves content for the author search page, including a random selection of approved authors. This method is used to provide dynamic content for the author search page, allowing users to discover new authors through a random selection. It calls the getRandomAuthors method to fetch a random set of approved authors and structures the content with a title and subtitle for display on the search page.
   * @description This method retrieves content for the author search page by fetching a random selection of approved authors. It utilizes the getRandomAuthors method to obtain a list of random authors and then structures the content into an array of objects, each containing a title, subtitle, and the list of authors. This structured content is intended to be displayed on the author search page, providing users with an engaging way to discover new authors. The method returns this content in a format that can be easily rendered on the frontend.
   * @returns A promise resolving to an array of objects containing the search page content. Each object includes a title, subtitle, and a list of randomly selected approved authors.
   * @throws InternalServerErrorException if there is an error during the retrieval of random authors for the search page content.
   */
  async getSearchAuthorContent() {
    const randomAuthors = await this.getRandomAuthors();
    const searchPageContent = [
      {
        title: 'Discover New Authors',
        subtitle: 'Explore a random selection of authors',
        data: randomAuthors,
      },
    ];
    return searchPageContent;
  }

  /**
   * @summary Retrieves content for the "Discover Authors" section, including a genre spotlight and personalized recommendations based on the user's favorite authors. This method is used to provide dynamic and personalized content for the "Discover Authors" section, allowing users to explore authors based on a random genre spotlight and receive recommendations based on their preferences. It calls the getAuthorByGenreSpotlight method to fetch authors related to a randomly selected genre and the getRecommendedAuthors method to fetch personalized recommendations based on the user's favorite authors. The content is structured with titles and subtitles for display in the "Discover Authors" section.
   * @description This method retrieves content for the "Discover Authors" section by combining a genre spotlight and personalized recommendations. It first calls the getAuthorByGenreSpotlight method to fetch authors related to a randomly selected genre, which provides a dynamic and engaging way for users to discover authors based on different genres. Then, it calls the getRecommendedAuthors method, passing the user's ID, to fetch personalized recommendations based on the user's favorite authors. The results from both methods are structured into an array of objects, each containing a title, subtitle, and the corresponding list of authors. This structured content is intended to be displayed in the "Discover Authors" section, offering users both genre-based discovery and personalized recommendations.
   * @param userId The ID of the user for whom to retrieve personalized recommendations.
   * @returns A promise resolving to an array of objects containing the discover authors content.
   */
  async getDiscoverAuthorsContent(userId: string) {
    const getAuthorGenreSpotlight = await this.getAuthorByGenreSpotlight();
    const getRecommendedAuthors = await this.getRecommendedAuthors(userId);
    const discoverAuthorsContent = [
      {
        title: `${getAuthorGenreSpotlight.genre} Unfolded`,
        subtitle: 'Handpicked authors just for you.',
        data: getAuthorGenreSpotlight.data,
      },
      {
        title: 'More Like',
        subtitle: `${getRecommendedAuthors?.basedOn?.name}`,
        data: getRecommendedAuthors.data,
        profilePic: getRecommendedAuthors?.basedOn?.smallerProfilePic,
      },
    ];
    return discoverAuthorsContent;
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
   * @summary Retrieves authors for a genre spotlight feature by selecting a random genre and finding authors who have books in that genre. This method is used to provide dynamic content for a genre spotlight feature, allowing users to discover authors based on different genres. It first selects a random genre using the getRandomGenre method, then defines filters for each genre to identify relevant keywords. Finally, it queries the database to find authors who have approved status and have books that match the genre filters, returning the authors along with the name of the genre for display in the spotlight.
   * @description This method retrieves authors for a genre spotlight feature by first selecting a random genre from a predefined list. It then defines specific keyword filters for each genre to identify relevant books. The method queries the database to find authors who have an approved status and have books that match the genre filters based on the defined keywords. The results include the authors that fit the criteria and the name of the genre, which can be used to display a spotlight section on the frontend, allowing users to explore authors associated with different genres.
   * @returns A promise resolving to an object containing the list of authors and the name of the genre.
   */
  async getAuthorByGenreSpotlight() {
    const randomGenre = this.getRandomGenre();
    const forProd =
      randomGenre.charAt(0).toUpperCase() +
      randomGenre
        .slice(1)
        .replace(/-\w/, (match) => ' ' + match[1].toUpperCase());

    const genreFilters: Record<GenreType, any> = {
      history: { keywords: ['history'] },
      fiction: { keywords: ['fiction'] },
      romance: { keywords: ['romance', 'love'] },
      'young-adult': { keywords: ['adult'] },
      fantasy: { keywords: ['magic', 'fantasy'] },
      thriller: { keywords: ['thriller', 'horror'] },
      'social-science': { keywords: ['economics', 'politic', 'business'] },
      'just-science': { keywords: ['science'] },
    };

    const filters = genreFilters[randomGenre as GenreType];

    const authors = await this.prisma.author.findMany({
      where: {
        AND: [
          { approveStatus: true },
          {
            books: {
              some: {
                genres: {
                  some: {
                    OR: filters.keywords.map((kw) => ({
                      genre: { name: { contains: kw, mode: 'insensitive' } },
                    })),
                  },
                },
              },
            },
          },
        ],
      },
    });
    return { data: authors, genre: forProd };
  }

  /**
   * @summary Retrieves personalized author recommendations for a user based on their favorite authors. This method is used to provide personalized content for users by recommending authors that are similar to their favorite authors. It first retrieves the user's favorite authors, then selects one of them at random (or a random author if the user has no favorites) to identify the genres associated with that author. Finally, it queries the database to find other approved authors who have books in those genres, returning a list of recommended authors along with the name and profile picture of the author that the recommendations are based on.
   * @description This method retrieves personalized author recommendations for a user by first fetching the user's favorite authors from the database. If the user has favorite authors, it randomly selects one of them; if not, it randomly selects any approved author. It then identifies the genres associated with the selected author by querying the book genres linked to that author. Using the identified genres, the method queries the database to find other approved authors who have books in those genres. The results include a list of recommended authors and information about the author that served as the basis for the recommendations, such as their name and profile picture, which can be used to display personalized recommendations on the frontend.
   * @param userId The ID of the user for whom to retrieve personalized author recommendations.
   * @param take The number of recommended authors to return.
   * @returns A promise resolving to an object containing the list of recommended authors and information about the author that served as the basis for the recommendations.
   */
  async getRecommendedAuthors(userId: string, take: number = 15) {
    const favoriteAuthors = await this.prisma.favoriteAuthor.findMany({
      where: { userId: userId },
      select: { authorId: true },
    });

    let selectedAuthorId: string;

    if (favoriteAuthors.length > 0) {
      const randomIndex = Math.floor(Math.random() * favoriteAuthors.length);
      selectedAuthorId = favoriteAuthors[randomIndex].authorId;
    } else {
      const totalAuthors = await this.prisma.author.count();

      const skip = Math.floor(Math.random() * totalAuthors);
      const randomAuthor = await this.prisma.author.findFirst({
        skip: skip,
        select: { id: true },
      });
      selectedAuthorId = randomAuthor!.id;
    }

    const authorGenres = await this.prisma.bookGenres.findMany({
      where: {
        book: { authorId: selectedAuthorId },
      },
      select: {
        genre: { select: { name: true } },
      },
    });

    const genreNames = [...new Set(authorGenres.map((ag) => ag.genre.name))];

    if (genreNames.length === 0) {
      return {
        title: 'More Like',
        subtitle: ``,
        data: [],
      };
    }

    const recommendedAuthors = await this.prisma.author.findMany({
      where: {
        id: { not: selectedAuthorId },
        books: {
          some: {
            genres: {
              some: {
                genre: {
                  name: { in: genreNames },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        smallerProfilePic: true,
        biggerProfilePic: true,
        topWorks: true,
        nationality: true,
      },
      take: take,
    });

    return {
      data: recommendedAuthors,
      basedOn: await this.prisma.author.findUnique({
        where: { id: selectedAuthorId },
        select: { name: true, smallerProfilePic: true },
      }),
    };
  }
}
