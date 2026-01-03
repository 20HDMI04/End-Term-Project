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

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get('search')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async search(@Query('q') query: string) {
    const genres = await this.genresService.searchGenres(query);
    return genres.map((g) => g.name);
  }

  @Get()
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findAll(@Query() query: PaginationDto) {
    return this.genresService.findAll(query);
  }

  @Get(':id')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOne(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Get('top30-with-pictures')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  getTopGenresWithPopularBooks() {
    return this.genresService.getTopGenresWithPopularBooks();
  }

  @Delete(':id')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  remove(@Param('id') id: string) {
    return this.genresService.remove(id);
  }
}
