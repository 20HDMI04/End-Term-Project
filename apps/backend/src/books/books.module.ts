import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { S3Service } from 'src/s3/s3.service';
import { PrismaService } from 'src/prisma.service';
import { GenresService } from 'src/genres/genres.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [BooksController],
  providers: [BooksService, S3Service, PrismaService, GenresService],
  imports: [HttpModule],
})
export class BooksModule {}
