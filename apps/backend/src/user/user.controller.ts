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
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(SessionGuard, new RolesGuard(['user']))
  findOne(@Session() session: any) {
    const user_email = session.userDataInAccessToken.email;
    return this.userService.findOne(user_email);
  }

  @Patch('me')
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
