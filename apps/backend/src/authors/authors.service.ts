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

@Injectable()
export class AuthorsService {
  private readonly logger = new Logger(AuthorsService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
    private readonly genresService: GenresService,
    private readonly httpService: HttpService,
  ) {}

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
          'Hiba történt a kép feltöltésekor.',
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

  async findAll(query: PaginationDto, admin: boolean) {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {
      approveStatus: admin ? false : true,
    };

    if (search) {
      whereCondition.name = { contains: search, mode: 'insensitive' };
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
        );
      default:
        orderBy = { name: 'asc' };
    }

    try {
      const [data, total] = await Promise.all([
        this.prisma.author.findMany({
          where: whereCondition,
          skip,
          take: limit,
          orderBy,
          include: {
            _count: {
              select: { favoritedBy: true, books: true },
            },
          },
        }),
        this.prisma.author.count({ where: whereCondition }),
      ]);

      return {
        data,
        meta: { total, page, lastPage: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new InternalServerErrorException('Database error during get All.');
    }
  }

  private async findAllSortedByRating(
    where: any,
    skip: number,
    take: number,
    order: 'asc' | 'desc',
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

  findOne(id: string) {
    return this.prisma.author.findUniqueOrThrow({ where: { id } });
  }

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
  async removeByOpenLibraryId(olId: string) {
    // Find author by Open Library ID
    const author = await this.prisma.author.findUnique({
      where: { openLibraryId: olId },
    });

    if (!author) {
      throw new NotFoundException(
        `Nem található szerző ezzel az Open Library azonosítóval: ${olId}`,
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

  async disapprove(id: string) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException('Szerző nem található.');

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
  async findSimilarBySubject(authorId: string, minCommon: number = 2) {
    const target = await this.prisma.author.findUnique({
      where: { id: authorId },
    });
    if (!target || !target.subjects) return [];

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

  async findSimilarByGenres(authorId: string, minCommonGenres: number = 2) {
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
}
