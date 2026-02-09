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
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiCookieAuth,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({
    summary: 'Author creation',
    description: 'Creates a new author with an optional uploaded image.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCookieAuth()
  @ApiResponse({
    status: 201,
    description: 'Successful creation of an author.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to create an author.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden. The user does not have the "user" role.',
  })
  @ApiConflictResponse({
    description: 'Conflict. This author already exists in the database.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error. Error occurred during image upload.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error. Database error during save.',
  })
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  create(
    @File() file: UploadedFile | null,
    @Body() createAuthorDto: CreateAuthorDto,
  ) {
    return this.authorsService.create(file, createAuthorDto);
  }

  @Get('search-external')
  @ApiOperation({
    summary: 'Search external authors',
    description:
      'Searches for authors in an external database by name.(Open Library API, Google Books API)',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to search external authors.',
  })
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'The name of the author to search for.',
    example: 'Tolkien',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful search.',
    isArray: true,
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async searchExternal(@Query('name') name: string) {
    return await this.authorsService.searchExternal(name);
  }

  @Get('pending-approvals')
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of pending approvals.',
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to get pending approvals.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden. The user does not have the "admin" role.',
  })
  @ApiOperation({
    summary: 'Get pending approvals',
    description:
      'Retrieves a list of authors that are pending approval for admin review.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error. Database error during retrieval.',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Pagination and filtering options for pending approvals.',
    type: PaginationDto,
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  findPendingApprovals(@Query() query: PaginationDto) {
    return this.authorsService.findAll(query, true);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all authors',
    description: 'Retrieves a list of all authors with optional pagination.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to find all authors.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error. Database error during retrieval.',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Pagination and filtering options for all authors.',
    type: PaginationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of all authors.',
    isArray: true,
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findAll(@Query() query: PaginationDto) {
    return this.authorsService.findAll(query, false);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get moderation stats',
    description:
      'Retrieves statistics about authors pending approval, approved, and rejected for admin review.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to get stats of authors.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden. The user does not have the "admin" role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of stats.',
    isArray: true,
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async getStats() {
    return await this.authorsService.getModerationAuthorStats();
  }

  @Get(':id/related-by-subjects')
  @ApiOperation({
    summary: 'Get related authors by subjects',
    description: 'Retrieves authors related by subjects for a given author ID.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to get related authors by subjects.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. The author with the given ID does not exist.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of related authors by subjects.',
    isArray: true,
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async getRelated(@Param('id') id: string) {
    return await this.authorsService.findSimilarBySubject(id);
  }

  @Get(':id/related-by-genres')
  @ApiOperation({
    summary: 'Get related authors by genres',
    description: 'Retrieves authors related by genres for a given author ID.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to get related authors by genres.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. The author with the given ID does not exist.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of related authors by genres.',
    isArray: true,
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  async getRelatedByGenres(@Param('id') id: string) {
    return await this.authorsService.findSimilarByGenres(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get author by ID',
    description: 'Retrieves a single author by their ID.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to get an author by ID.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. The author with the given ID does not exist.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of an author by ID.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update author',
    description:
      'Updates an existing author by ID with optional new image upload.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to update an author.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden. The user does not have the "admin" role.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. The author with the given ID does not exist.',
  })
  @ApiConflictResponse({
    description:
      'Conflict. This Open Library ID already belongs to another author.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error. Error occurred during image upload.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error. Database error during update.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  update(
    @Param('id') id: string,
    @File() file: UploadedFile | null,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, file, updateAuthorDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete author',
    description:
      'Deletes an author by either their ID or Open Library ID. Provide either "id" or "olId" as a query parameter.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to delete an author.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden. The user does not have the "admin" role.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. The author with the given ID does not exist.',
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request. Either "id" or "olId" query parameter must be provided.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async removeFlexible(@Query('olId') olId?: string, @Query('id') id?: string) {
    if (olId) {
      return await this.authorsService.removeByOpenLibraryId(olId);
    }
    if (id) {
      return await this.authorsService.remove(id);
    }
    throw new BadRequestException('ID or Open Library ID is required.');
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve author',
    description: 'Approves an author by ID to see the author by users.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to approve an author.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden. The user does not have the "admin" role.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. The author with the given ID does not exist.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async approve(@Param('id') id: string) {
    return await this.authorsService.approve(id);
  }

  @Patch(':id/disapprove')
  @ApiOperation({
    summary: 'Disapprove author',
    description: 'Disapproves an author by ID to hide the author from users.',
  })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to disapprove an author.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden. The user does not have the "admin" role.',
  })
  @ApiNotFoundResponse({
    description: 'Not Found. The author with the given ID does not exist.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['admin']))
  async disapprove(@Param('id') id: string) {
    return await this.authorsService.disapprove(id);
  }
}
