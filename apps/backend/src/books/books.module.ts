import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { S3Service } from 'src/s3/s3.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService, S3Service],
})
export class BooksModule {}
