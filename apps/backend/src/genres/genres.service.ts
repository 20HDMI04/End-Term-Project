import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

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

  async searchGenres(query: string) {
    if (!query || query.length < 2) return [];

    return this.prisma.genres.findMany({
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
  }

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
      throw error;
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
      throw new BadRequestException('Failed to fetch genres');
    }
  }

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
      throw new BadRequestException('Failed to fetch genres with book counts');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.genres.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(`Genre not found with the ID ${id}`);
    }
  }

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
      throw new BadRequestException('Failed to fetch top genres.');
    }
  }

  async remove(id: string) {
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
      throw new BadRequestException('Failed to delete genre');
    }
  }
}
