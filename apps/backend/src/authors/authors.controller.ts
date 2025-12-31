import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Query,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { FastifyFileInterceptor } from 'src/common/interceptors/fastify-file.interceptor';
import { File } from 'src/common/decorators/file.decorator';
import type { UploadedFile } from 'src/common/types/types';
import { SessionGuard } from 'src/auth/session.guard';
import { PaginationDto } from './dto/pagination.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  create(
    @File() file: UploadedFile | null,
    @Body() createAuthorDto: CreateAuthorDto,
  ) {
    return this.authorsService.create(file, createAuthorDto);
  }

  @Get('search-external')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async searchExternal(@Query('name') name: string) {
    return await this.authorsService.searchExternal(name);
  }

  @Get('pending-approvals')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  findPendingApprovals(@Query() query: PaginationDto) {
    return this.authorsService.findAll(query, true);
  }

  @Get()
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findAll(@Query() query: PaginationDto) {
    return this.authorsService.findAll(query, false);
  }

  @Get('stats')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async getStats() {
    return await this.authorsService.getModerationAuthorStats();
  }

  @Get(':id/related-by-subjects')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async getRelated(@Param('id') id: string) {
    return await this.authorsService.findSimilarBySubject(id);
  }

  @Get(':id/related-by-genres')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async getRelatedByGenres(@Param('id') id: string) {
    return await this.authorsService.findSimilarByGenres(id);
  }

  @Get(':id')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  update(
    @Param('id') id: string,
    @File() file: UploadedFile | null,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, file, updateAuthorDto);
  }

  @Delete(':id')
  @Delete('remove')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async removeFlexible(@Query('olId') olId?: string, @Query('id') id?: string) {
    if (olId) {
      return await this.authorsService.removeByOpenLibraryId(olId);
    }
    if (id) {
      return await this.authorsService.remove(id);
    }
    throw new BadRequestException('ID vagy Open Library ID megadása kötelező.');
  }

  @Patch(':id/approve')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async approve(@Param('id') id: string) {
    return await this.authorsService.approve(id);
  }

  @Patch(':id/disapprove')
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async disapprove(@Param('id') id: string) {
    return await this.authorsService.disapprove(id);
  }
}
