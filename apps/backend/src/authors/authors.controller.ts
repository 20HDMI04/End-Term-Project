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
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { FastifyFileInterceptor } from 'src/common/interceptors/fastify-file.interceptor';
import { File } from 'src/common/decorators/file.decorator';
import type { UploadedFile } from 'src/common/types/types';

import { SessionGuard } from 'src/auth/session.guard';
import { User } from 'supertokens-node';

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

  @Get()
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorsService.update(+id, updateAuthorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorsService.remove(+id);
  }
}
