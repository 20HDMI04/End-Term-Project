import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}
  async getOrCreateMany(rawGenreNames: string[]) {
    const explodedNames = rawGenreNames
      .flatMap((name) => name.split(' / '))
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const uniqueNames = [...new Set(explodedNames)];

    const genrePromises = uniqueNames.map((name) =>
      this.prisma.genres.upsert({
        where: { name: name },
        update: {},
        create: { name: name },
      }),
    );

    const results = await Promise.all(genrePromises);
    return results;
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
