import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { UploadedFile } from 'src/common/types/types';
import { S3Service } from 'src/s3/s3.service';
import UserRoles from 'supertokens-node/recipe/userroles';
import Session from 'supertokens-node/recipe/session';
import { getUserContext } from 'supertokens-node/lib/build/utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  findOne(email: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { email: email },
      omit: {
        id: true,
        biggerProfilePicKey: true,
        smallerProfilePicKey: true,
        username: true,
      },
    });
  }

  async update(
    email: string,
    file: UploadedFile | null,
    updateUserDto: UpdateUserDto,
    isFirstTime: boolean,
  ) {
    if (isFirstTime && typeof updateUserDto.nickname !== 'string') {
      throw new BadRequestException(
        'Nickname is required for first-time update',
      );
    }
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: email },
    });
    const imageTitle = user.email.split('@')[0];

    if (
      user.smallerProfilePicKey != null &&
      user.biggerProfilePicKey != null &&
      file != null
    ) {
      try {
        await this.s3Service.deleteImages('profile', [
          user.smallerProfilePicKey,
          user.biggerProfilePicKey,
        ]);
      } catch (error) {
        console.error('Error deleting previous images from S3:', error);
        throw new InternalServerErrorException(
          'Failed to delete previous images',
        );
      }
    }
    let res: { small: string; large: string; keys: string[] } | null = null;
    if (file != null) {
      try {
        res = await this.s3Service.uploadImage(file, 'profile', imageTitle);
      } catch (error) {
        console.error('Error uploading images to S3:', error);
        throw new InternalServerErrorException('Failed to upload images');
      }
    }
    try {
      const updatedUser = await this.prisma.user.update({
        where: { email: email },
        data: {
          ...updateUserDto,
          smallerProfilePicKey: res ? res.keys[0] : user.smallerProfilePicKey,
          biggerProfilePicKey: res ? res.keys[1] : user.biggerProfilePicKey,
          biggerProfilePic: res ? res.large : user.biggerProfilePic,
          smallerProfilePic: res ? res.small : user.smallerProfilePic,
        },
        omit: {
          id: true,
          biggerProfilePicKey: true,
          smallerProfilePicKey: true,
          username: true,
        },
      });

      if (isFirstTime) {
        const stUserId = user.username;

        const sessionHandles =
          await Session.getAllSessionHandlesForUser(stUserId);

        await UserRoles.removeUserRole('public', stUserId, 'new_user');

        const rolesResponse = await UserRoles.getRolesForUser(
          'public',
          stUserId,
        );
        const currentRoles = rolesResponse.roles;

        for (const sessionHandle of sessionHandles) {
          await Session.mergeIntoAccessTokenPayload(sessionHandle, {
            roles: currentRoles,
            _updatedAt: Date.now(),
          });
        }
        console.log('Roles updated in database and sessions:', currentRoles);
      }
      return updatedUser;
    } catch (error) {
      console.error('Error updating user in database:', error);
      if (res) {
        try {
          await this.s3Service.deleteImages('profile', res.keys);
        } catch (deleteError) {
          console.error(
            'Error deleting images from S3 after failed update:',
            deleteError,
          );
        }
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }
}
