import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PrismaService } from 'src/prisma.service';

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
    console.log('GenresService.getOrCreateMany called with names:', names);
    // 1. Normalize all incoming names (e.g., "horror" -> "Horror", "SCI-FI" -> "Sci-Fi")
    const normalizedInputNames = [
      ...new Set(names.map((name) => this.normalizeName(name))),
    ];

    // 2. Get existing genres from the database
    const existingGenres = await this.prisma.genres.findMany({
      where: {
        name: { in: normalizedInputNames, mode: 'insensitive' },
      },
    });

    const existingNames = existingGenres.map((g) => g.name);

    // 3. Filter out those that are not yet included
    const newNames = normalizedInputNames.filter(
      (name) =>
        !existingNames.some(
          (existing) => existing.toLowerCase() === name.toLowerCase(),
        ),
    );

    // 4. Save new genres
    if (newNames.length > 0) {
      await this.prisma.genres.createMany({
        data: newNames.map((name) => ({ name })),
        skipDuplicates: true,
      });
    }
    // 5. All genres
    return this.prisma.genres.findMany({
      where: {
        name: { in: normalizedInputNames, mode: 'insensitive' },
      },
    });
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

  create(createGenreDto: CreateGenreDto) {
    return 'This action adds a new genre';
  }

  findAll() {
    return `This action returns all genres`;
  }

  findOne(id: number) {
    return `This action returns a #${id} genre`;
  }

  update(id: number, updateGenreDto: UpdateGenreDto) {
    return `This action updates a #${id} genre`;
  }

  remove(id: number) {
    return `This action removes a #${id} genre`;
  }
}
