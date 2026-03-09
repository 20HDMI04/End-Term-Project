import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Session,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SessionGuard } from 'src/auth/session.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { FastifyFileInterceptor } from 'src/common/interceptors/fastify-file.interceptor';
import { UploadedFile } from 'src/common/types/types';
import { File } from 'src/common/decorators/file.decorator';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the profile information of the currently authenticated user.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The user profile has been successfully retrieved.',
  })
  @ApiNotFoundResponse({
    description: 'User with the specified email was not found.',
  })
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOne(@Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.userService.findOne(user_email);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Updates the profile information of the currently authenticated user. If this is the first time the user is updating their profile, a nickname must be provided.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The user profile has been successfully updated.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while uploading the user profile picture.',
  })
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  update(
    @Session() session: any,
    @File() file: UploadedFile | null,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user_email = session.userDataInAccessToken.email;
    return this.userService.update(user_email, file, updateUserDto, false);
  }

  @Patch('me-the-first-time')
  @ApiOperation({
    summary: 'First time update of current user profile',
    description:
      'Updates the profile information of the currently authenticated user for the first time. A nickname must be provided.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'The user profile has been successfully updated.',
  })
  @ApiBadRequestResponse({
    description: 'Nickname is required for first-time update.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'An unexpected error occurred while uploading the user profile picture.',
  })
  @UseInterceptors(FastifyFileInterceptor)
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  updateFirstTime(
    @Session() session: any,
    @File() file: UploadedFile | null,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user_email = session.userDataInAccessToken.email;
    return this.userService.update(user_email, file, updateUserDto, true);
  }
}
