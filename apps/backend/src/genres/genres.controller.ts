import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PaginationDto } from './dto/pagination.dto';
import { SessionGuard } from 'src/auth/session.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import {
  ApiOperation,
  ApiTags,
  ApiCookieAuth,
  ApiResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new genre (admin only)',
    description:
      'Creates a new genre with the provided name. Only accessible by admin users.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 201,
    description: 'The genre has been successfully created.',
  })
  @ApiConflictResponse({
    description: 'A genre with the same name already exists.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while creating the genre.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search genres by name',
    description:
      'Searches for genres that match the provided query string. Accessible by all authenticated users.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The search results have been successfully retrieved.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while searching for genres.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async search(@Query('q') query: string) {
    const genres = await this.genresService.searchGenres(query);
    return genres.map((g) => g.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of genres',
    description:
      'Retrieves a paginated list of genres with optional search and sorting. Accessible by all authenticated users.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description:
      'The paginated list of genres has been successfully retrieved.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while retrieving the genres.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findAll(@Query() query: PaginationDto) {
    return this.genresService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a genre by ID',
    description:
      'Retrieves a genre by its unique identifier. Accessible by all authenticated users.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The genre has been successfully retrieved.',
  })
  @ApiNotFoundResponse({
    description: 'The genre with the specified ID was not found.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOne(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Get('top30-with-pictures')
  @ApiOperation({
    summary: 'Get top 30 genres with popular books',
    description:
      'Retrieves the top 30 genres along with their most popular books. Accessible by all authenticated users.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description:
      'The top genres with their popular books have been successfully retrieved.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while retrieving the top genres and their popular books.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  getTopGenresWithPopularBooks() {
    return this.genresService.getTopGenresWithPopularBooks();
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a genre by ID (admin only)',
    description:
      'Deletes a genre by its unique identifier. Only accessible by admin users.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The genre has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'The genre with the specified ID was not found.',
  })
  @ApiConflictResponse({
    description:
      'Cannot delete genre: it is linked to existing books. Please remove the associated books first.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while deleting the genre.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  remove(@Param('id') id: string) {
    return this.genresService.remove(id);
  }
}
