import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import type { UploadedFile } from 'src/common/types/types';
import { S3Service } from 'src/s3/s3.service';
import { PrismaService } from 'src/prisma.service';
import { GenresService } from 'src/genres/genres.service';

@Injectable()
export class BooksService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly prisma: PrismaService,
    private readonly genresService: GenresService,
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

          authorId: createBookDto.authorId ?? undefined,
          originalPublisher: createBookDto.originalPublisher ?? undefined,
          originalPublicationYear:
            createBookDto.originalPublicationYear ?? undefined,
          latestPublicationYear:
            createBookDto.latestPublicationYear ?? undefined,
          pageNumber: createBookDto.pageNumber ?? 0,

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
