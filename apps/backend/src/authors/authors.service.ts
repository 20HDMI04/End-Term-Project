import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
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

  findAll() {
    return `This action returns all authors`;
  }

  findOne(id: number) {
    return `This action returns a #${id} author`;
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return `This action updates a #${id} author`;
  }

  remove(id: number) {
    return `This action removes a #${id} author`;
  }
}
