import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { HttpModule } from '@nestjs/axios';
import { GenresService } from 'src/genres/genres.service';

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsService, S3Service, PrismaService, GenresService],
  imports: [HttpModule],
  exports: [AuthorsService],
})
export class AuthorsModule {}
