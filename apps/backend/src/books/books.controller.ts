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

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard)
  create(@File() file: UploadedFile, @Body() createBookDto: CreateBookDto) {
    return this.booksService.create(file, createBookDto);
  }

  @Post('fetch-for-creation')
  async fetchForCreation(@Body() searchByIsbnDto: SearchByIsbnDto) {
    return await this.booksService.getOrFetchExternalBook(searchByIsbnDto.isbn);
  }

  @Post('approve/:id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  approve(@Param('id') id: string) {
    return this.booksService.approve(id);
  }

  @Post('disapprove/:id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  disapprove(@Param('id') id: string) {
    return this.booksService.disapprove(id);
  }

  @Get('proxy-image')
  async proxyImage(@Query('url') url: string, @Res() res) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    res.type('image/jpeg').send(response.data);
  }

  @Get()
  @UseGuards(SessionGuard)
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
