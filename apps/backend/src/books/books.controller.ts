import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { File } from 'src/common/decorators/file.decorator';
import { FastifyFileInterceptor } from 'src/common/interceptors/fastify-file.interceptor';
import type { UploadedFile } from 'src/common/types/types';
import { SessionGuard } from 'src/auth/session.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { SearchByIsbnDto } from './dto/search-by-isbn.dto';
import { Query, Res } from '@nestjs/common/decorators';
import axios from 'axios';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  create(
    @File() file: UploadedFile | null,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.booksService.create(file, createBookDto);
  }

  @Post('fetch-for-creation')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async fetchForCreation(@Body() searchByIsbnDto: SearchByIsbnDto) {
    return await this.booksService.getOrFetchExternalBook(searchByIsbnDto.isbn);
  }

  @Patch('approve/:id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  approve(@Param('id') id: string) {
    return this.booksService.approve(id);
  }

  @Patch('disapprove/:id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  disapprove(@Param('id') id: string) {
    return this.booksService.disapprove(id);
  }

  @Get()
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  @UseInterceptors(FastifyFileInterceptor)
  async update(
    @Param('id') id: string,
    @File() file: UploadedFile | null,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, file, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
