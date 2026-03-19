import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { UploadedFile } from 'src/common/types/types';
import { S3Service } from 'src/s3/s3.service';
import UserRoles from 'supertokens-node/recipe/userroles';
import Session from 'supertokens-node/recipe/session';
import { getUserContext } from 'supertokens-node/lib/build/utils';
import SuperTokens from 'supertokens-node';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * @summary Get user profile by email
   * @description Retrieves the user profile information based on the provided email address. If the user is not found, a NotFoundException is thrown.
   * @param email The email address of the user whose profile is to be retrieved.
   * @returns The user profile information, excluding sensitive fields such as id and S3 keys.
   * @throws  {@link NotFoundException} if no user with the specified email is found in the database.
   */
  async findOne(email: string) {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { email: email },
        omit: {
          id: true,
          biggerProfilePicKey: true,
          smallerProfilePicKey: true,
          username: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        'User with the specified email was not found.',
      );
    }
  }

  /**
   * @summary Update user profile by email
   * @description Updates the profile information of the user with the specified email address. If the user is not found, a NotFoundException is thrown.
   * @param email The email address of the user whose profile is to be updated.
   * @param file The uploaded file for the user's profile picture.
   * @param updateUserDto The data for updating the user's profile.
   * @param isFirstTime A flag indicating whether this is the first time the user is updating their profile.
   * @returns The updated user profile information, excluding sensitive fields such as id and S3 keys.
   * @throws  {@link NotFoundException} if no user with the specified email is found in the database.
   * @throws  {@link BadRequestException} if the nickname is required for first-time update but not provided.
   * @throws  {@link InternalServerErrorException} if an unexpected error occurs while updating the user or uploading images.
   */
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
        console.log('SuperTokens user ID:', stUserId);
        const stUser = await SuperTokens.getUser(stUserId);
        const tenantId = stUser?.tenantIds[0] || 'public';

        const removeResult = await UserRoles.removeUserRole(
          tenantId,
          stUserId,
          'new_user',
        );
        console.log("Result of removing 'new_user' role:", removeResult);
        if (removeResult.status !== 'OK') {
          console.error(
            'Error removing new_user role from user:',
            removeResult.status,
          );
        }

        const rolesResponse = await UserRoles.getRolesForUser(
          tenantId,
          stUserId,
        );
        console.log('Current roles for user after update:', rolesResponse);
        const currentRoles = rolesResponse.roles;

        const sessionHandles =
          await Session.getAllSessionHandlesForUser(stUserId);
        for (const sessionHandle of sessionHandles) {
          await Session.mergeIntoAccessTokenPayload(sessionHandle, {
            roles: currentRoles,
            _updatedAt: Date.now(),
          });
        }
      }
      console.log('Updated user profile:', updatedUser);
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
