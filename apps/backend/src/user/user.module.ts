import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, S3Service],
})
export class UserModule {}
