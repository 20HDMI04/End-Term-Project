import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @summary Normalizes a genre names.
   * @description This method takes a genre name as input and normalizes it by converting it to lowercase, trimming whitespace, and capitalizing the first letter of each word. This ensures that genre names are stored in a consistent format in the database.
   * @param name The genre name to normalize.
   * @returns The normalized genre name.
   */
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * @summary Retrieves or creates genres in bulk based on the provided list of genre names.
   * @description This method takes a list of genre names, normalizes them, and checks which ones already exist in the database. It then creates any new genres that do not already exist and returns the complete list of genres corresponding to the provided names. This is useful for efficiently handling bulk operations when associating genres with books or other entities.
   * @param names The list of genre names to process.
   * @returns The list of genres that were either created or already existed.
   * @throws {@link InternalServerErrorException} If there was an error processing the genres in bulk.
   */
  async getOrCreateMany(names: string[]) {
    if (!names || names.length === 0) return [];

    try {
      // Normalize input names and remove duplicates
      const normalizedInputNames = [
        ...new Set(names.map((name) => this.normalizeName(name))),
      ];

      // Existing genres retrieval
      const existingGenres = await this.prisma.genres.findMany({
        where: {
          name: { in: normalizedInputNames, mode: 'insensitive' },
        },
      });

      const existingNames = existingGenres.map((g) => g.name.toLowerCase());

      // Filter out, we need to add only the new ones
      const newNames = normalizedInputNames.filter(
        (name) => !existingNames.includes(name.toLowerCase()),
      );

      // New genres adding
      if (newNames.length > 0) {
        await this.prisma.genres.createMany({
          data: newNames.map((name) => ({ name })),
          skipDuplicates: true,
        });
      }

      // All genres retrieval
      return await this.prisma.genres.findMany({
        where: {
          name: { in: normalizedInputNames, mode: 'insensitive' },
        },
      });
    } catch (error) {
      console.error('Error processing genres in bulk:', error);
      throw new InternalServerErrorException(
        'Failed to process the provided genres.',
      );
    }
  }

  /**
   *
   * @summary Searches for genres that match the provided query string.
   * @description This method takes a query string as input and searches for genres in the database that contain the query string in their name, ignoring case. It returns a list of matching genres, limited to a maximum of 10 results. This is useful for implementing search functionality when users are looking for specific genres.
   * @param query The query string to search for in genre names.
   * @returns A list of genres that match the search criteria.
   * @throws {@link InternalServerErrorException} If there was an error while searching for genres.
   */
  async searchGenres(query: string) {
    if (!query || query.length < 2) return [];

    try {
      return await this.prisma.genres.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        take: 10,
        select: {
          name: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to search for genres.');
    }
  }

  /**
   *
   * @summary Creates a new genre with the provided name.
   * @description This method takes a DTO containing the name of the genre to be created. It normalizes the genre name and attempts to create a new genre in the database. If a genre with the same name already exists, it throws a ConflictException. If there is any other error during the creation process, it throws an InternalServerErrorException. This method is typically used by admin users to add new genres to the system.
   * @param createGenreDto The DTO containing the genre name to be created.
   * @returns The created genre object.
   * @throws {@link ConflictException} If a genre with the same name already exists.
   * @throws {@link InternalServerErrorException} If there was an error while creating the genre.
   */
  async create(createGenreDto: CreateGenreDto) {
    const normalizedName = this.normalizeName(createGenreDto.name);
    try {
      return await this.prisma.genres.create({
        data: { name: normalizedName },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Genre with this name already exists');
      }
      throw new InternalServerErrorException(
        'Failed to create genre: ' + error,
      );
    }
  }

  /**
   *
   * @summary Retrieves a paginated list of genres based on the provided query parameters.
   * @description This method takes a PaginationDto object as input and retrieves a paginated list of genres from the database. It supports filtering by search term, sorting by name or book count, and ordering in ascending or descending order. The results are limited to a maximum number of items per page.
   * @param query The pagination and filtering parameters.
   * @returns A list of genres matching the criteria.
   * @throws {@link InternalServerErrorException} If there was an error while retrieving the genres.
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
      case 'booksnumber':
        return this.getGenresWithBookCounts(
          whereCondition,
          skip,
          limit,
          sortOrder,
        );
      default:
        orderBy = { name: sortOrder };
    }

    try {
      return await this.prisma.genres.findMany({
        skip: skip,
        take: limit,
        where: whereCondition,
        orderBy: orderBy,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch genres.');
    }
  }

  /**
   *
   * @summary Retrieves a genre by its unique identifier.
   * @description This method takes a genre ID as input and attempts to retrieve the corresponding genre from the database. If the genre is found, it is returned. If no genre with the specified ID exists, a NotFoundException is thrown. This method is typically used to display detailed information about a specific genre.
   * @param where The where condition for filtering genres.
   * @param skip The number of genres to skip.
   * @param take The number of genres to take.
   * @param order The order in which to sort the genres.
   * @returns A list of genres matching the criteria.
   * @throws {@link InternalServerErrorException} If there was an error while retrieving the genre.
   */
  async getGenresWithBookCounts(
    where: any,
    skip: number,
    take: number,
    order: 'asc' | 'desc',
  ) {
    try {
      return await this.prisma.genres.findMany({
        skip: skip,
        take: take,
        where: {
          name: {
            contains: where.name?.contains || '',
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              books: true,
            },
          },
        },
        orderBy: {
          books: {
            _count: order,
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch genres with book counts.',
      );
    }
  }

  /**
   * @summary Retrieves a genre by its unique identifier.
   * @description This method takes a genre ID as input and attempts to retrieve the corresponding genre from the database. If the genre is found, it is returned. If no genre with the specified ID exists, a NotFoundException is thrown. This method is typically used to display detailed information about a specific genre.
   * @param id The unique identifier of the genre to retrieve.
   * @returns The genre with the specified ID.
   * @throws {@link NotFoundException} If no genre exists with the specified ID.
   */
  async findOne(id: string) {
    try {
      return await this.prisma.genres.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Genre not found with the ID ${id}`);
    }
  }

  /**
   * @summary Retrieves the top 30 genres along with their most popular books.
   * @description This method retrieves the top 30 genres from the database based on the number of approved books associated with each genre. For each of these top genres, it also retrieves up to 2 of their most popular approved books, sorted by average rating in descending order. This method is useful for displaying popular genres and their top books to users.
   * @returns A list of top genres with their popular books.
   * @throws {@link InternalServerErrorException} If there was an error while retrieving the top genres and their popular books.
   */
  async getTopGenresWithPopularBooks() {
    try {
      return await this.prisma.genres.findMany({
        where: {
          books: {
            some: {
              book: {
                approveStatus: true,
              },
            },
          },
        },
        take: 30,
        orderBy: {
          books: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              books: {
                where: {
                  book: { approveStatus: true },
                },
              },
            },
          },
          books: {
            where: {
              book: { approveStatus: true },
            },
            take: 2,
            orderBy: {
              book: {
                statistics: {
                  averageRating: 'desc',
                },
              },
            },
            select: {
              book: {
                select: {
                  id: true,
                  title: true,
                  smallerCoverPic: true,
                  biggerCoverPic: true,
                  statistics: {
                    select: {
                      averageRating: true,
                      ratingCount: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch top genres.');
    }
  }

  /**
   * @summary Removes a genre by its unique identifier.
   * @description This method takes a genre ID as input and attempts to delete the corresponding genre from the database. If the genre is not found, a NotFoundException is thrown. If the genre is linked to existing books, a ConflictException is thrown. Otherwise, the genre is deleted and returned.
   * @param id The unique identifier of the genre to remove.
   * @returns The deleted genre.
   * @throws {@link NotFoundException} If no genre exists with the specified ID.
   * @throws {@link ConflictException} If the genre is linked to existing books.
   * @throws {@link InternalServerErrorException} If there was an error while deleting the genre.
   */
  async remove(id: string) {
    try {
      let res = await this.prisma.genres.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Genre not found with the ID ${id}`);
    }
    try {
      return await this.prisma.genres.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete genre: it is linked to existing books.',
        );
      }
      throw new InternalServerErrorException('Failed to delete genre');
    }
  }
}
