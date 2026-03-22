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
  BadRequestException,
} from '@nestjs/common';
import { BooksService, GenreTypeEnum } from './books.service';
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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination-book.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthorsService } from 'src/authors/authors.service';
import type { GenreType } from './books.service';
import { Session } from 'src/auth/session.decorator';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly authorsService: AuthorsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new book',
    description: 'Creates a new book with an optional uploaded image.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 201,
    description: 'The book has been successfully created.',
  })
  @ApiConflictResponse({
    description:
      'A book with the same ISBN already exists. Or The book with the same title and author already exists.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while creating the book. Or Error occurred while uploading the book cover image. Please try again later.',
  })
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  create(
    @File() file: UploadedFile | null,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.booksService.create(file, createBookDto);
  }

  @Post('fetch-for-creation')
  @ApiOperation({
    summary: 'Fetch book details for creation',
    description:
      'Retrieves book details from an external source using the ISBN.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Book details retrieved successfully.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async fetchForCreation(@Body() searchByIsbnDto: SearchByIsbnDto) {
    return await this.booksService.getOrFetchExternalBook(searchByIsbnDto.isbn);
  }

  @Patch('approve/:id')
  @ApiOperation({
    summary: 'Approve a book',
    description: 'Approves a book, making it visible to users.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully approved.',
  })
  @ApiNotFoundResponse({
    description: 'The book with the specified ID was not found.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while approving the book. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  approve(@Param('id') id: string) {
    return this.booksService.approve(id);
  }

  @Patch('disapprove/:id')
  @ApiOperation({
    summary: 'Disapprove a book',
    description: 'Disapproves a book, hiding it from users.',
  })
  @ApiCookieAuth()
  @ApiNotFoundResponse({
    description: 'The book with the specified ID was not found.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while disapproving the book. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  disapprove(@Param('id') id: string) {
    return this.booksService.disapprove(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Find all books',
    description: 'Retrieves a list of all books with pagination support.',
  })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Books retrieved successfully.' })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the books. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findAll(@Query() query: PaginationDto, @Session() session: any) {
    const userId = session.userId;
    return this.booksService.findAll(query, false, userId);
  }

  @Get('random')
  @ApiOperation({
    summary: 'Find a random book',
    description: 'Retrieves the details of a random book.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Random book retrieved successfully.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the random book. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findRandom() {
    return this.booksService.findRandom();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find a book by ID',
    description: 'Retrieves the details of a specific book by its ID.',
  })
  @ApiCookieAuth()
  @ApiNotFoundResponse({
    description: 'The book with the specified ID was not found.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the book. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOne(@Param('id') id: string, @Session() session: any) {
    const email = session.email;
    return this.booksService.findOne(id, email);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a book',
    description:
      'Updates the details of a specific book, with an optional new image.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully updated.',
  })
  @ApiNotFoundResponse({
    description: 'The book with the specified ID was not found.',
  })
  @ApiConflictResponse({
    description:
      'A book with the same ISBN already exists. Or The book with the same title and author already exists.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while updating the book. Or Error occurred while uploading the new book cover image. Please try again later.',
  })
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
  @ApiOperation({
    summary: 'Remove a book',
    description: 'Deletes a specific book by its ID.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'The book with the specified ID was not found.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while deleting the book. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  @Get('mainpage')
  @ApiOperation({
    summary: 'Get main page content',
    description:
      'Retrieves the main page content, including featured authors and books.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Main page content retrieved successfully.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the main page content. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async mainPageContent() {
    const mainPageContent = {
      authors: await this.authorsService.getMainPageAuthors(),
      books: await this.booksService.getMainPageBooksWithSections(),
    };
    return mainPageContent;
  }

  @Get('byisbn/:isbn')
  @ApiOperation({
    summary: 'Find a book by ISBN',
    description: 'Retrieves the details of a specific book by its ISBN.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The book has been successfully retrieved.',
  })
  @ApiNotFoundResponse({
    description: 'The book with the specified ISBN was not found.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the book. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOneByIsbn(@Param('isbn') isbn: string) {
    return this.booksService.findOneByIsbn(isbn);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search for books, authors, and genres',
    description:
      'Searches for books, authors, and genres based on a query string.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while searching. Please try again later.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  searchforEverything(
    @Query('query') query: string,
    @Query('take') take: number = 10,
  ) {
    return this.booksService.searchforEverything(query, take);
  }

  @Get('specific-genre/:genre')
  @ApiOperation({
    summary: 'Get books by a specific genre',
    description: 'Retrieves books that belong to a specific genre.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Books retrieved successfully.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the books. Please try again later.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid genre type provided.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  getBooksByASpecificGenre(
    @Param('genre') genre: GenreType,
    @Query('take') take: number = 15,
  ) {
    if (!Object.values(GenreTypeEnum).includes(genre as GenreTypeEnum)) {
      throw new BadRequestException('Invalid genre type.');
    }
    return this.booksService.getBooksByASpecificGenre(genre, take);
  }
}
