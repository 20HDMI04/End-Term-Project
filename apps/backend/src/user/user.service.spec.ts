import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { S3Service } from 'src/s3/s3.service';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import UserRoles from 'supertokens-node/recipe/userroles';
import Session from 'supertokens-node/recipe/session';
import SuperTokens from 'supertokens-node';

const mockPrismaClient = {
  user: {
    findUniqueOrThrow: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
} as unknown as PrismaService;

// Mock S3Service
const mockS3Service = {
  deleteImages: vi.fn(),
  uploadImage: vi.fn(),
};

// Mock SuperTokens
vi.mock('supertokens-node', () => ({
  default: {
    getUser: vi.fn(),
  },
}));

// Mock UserRoles
vi.mock('supertokens-node/recipe/userroles', () => ({
  default: {
    removeUserRole: vi.fn(),
    getRolesForUser: vi.fn(),
  },
}));

// Mock Session
vi.mock('supertokens-node/recipe/session', () => ({
  default: {
    getAllSessionHandlesForUser: vi.fn(),
    mergeIntoAccessTokenPayload: vi.fn(),
  },
}));

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    vi.resetAllMocks();

    // Set default mock values
    (SuperTokens.getUser as any).mockResolvedValue({ tenantIds: ['public'] });
    (UserRoles.removeUserRole as any).mockResolvedValue({ status: 'OK' });
    (UserRoles.getRolesForUser as any).mockResolvedValue({ roles: [] });
    (Session.getAllSessionHandlesForUser as any).mockResolvedValue([]);

    service = new UserService(mockPrismaClient, mockS3Service as unknown as S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        email: 'test@example.com',
        nickname: 'TestUser',
        favoriteBooks: [],
        favoriteAuthors: [],
        ratings: [],
        comments: [],
        haveReadIt: [],
      };

      mockPrismaClient.user.findUniqueOrThrow = vi.fn().mockResolvedValue(mockUser);

      const result = await service.findOne('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          favoriteBooks: {
            include: {
              book: {
                include: {
                  statistics: true,
                },
              },
            },
          },
          favoriteAuthors: {
            include: {
              author: true,
            },
          },
          ratings: true,
          comments: true,
          haveReadIt: {
            include: {
              book: {
                include: {
                  statistics: true,
                },
              },
            },
          },
        },
        omit: {
          id: true,
          biggerProfilePicKey: true,
          smallerProfilePicKey: true,
          username: true,
        },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaClient.user.findUniqueOrThrow = vi.fn().mockRejectedValue(new Error('Not found'));

      await expect(service.findOne('nonexistent@example.com')).rejects.toThrow(NotFoundException);
      expect(mockPrismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        include: expect.any(Object),
        omit: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    const mockUser = {
      email: 'test@example.com',
      username: 'testuser',
      nickname: 'TestUser',
      smallerProfilePicKey: 'small-key',
      biggerProfilePicKey: 'big-key',
      smallerProfilePic: 'small-url',
      biggerProfilePic: 'big-url',
    };

    const updateDto = { nickname: 'NewNickname' };
    const file = { buffer: Buffer.from('test'), mimetype: 'image/png' } as any;

    beforeEach(() => {
      mockPrismaClient.user.findUniqueOrThrow = vi.fn().mockResolvedValue(mockUser);
      mockPrismaClient.user.update = vi.fn().mockResolvedValue({ ...mockUser, ...updateDto });
    });

    it('should update user profile successfully without file on first time', async () => {
      const result = await service.update('test@example.com', null, updateDto, true);

      expect(result).toEqual({ ...mockUser, ...updateDto });
      expect(mockS3Service.deleteImages).not.toHaveBeenCalled();
      expect(mockS3Service.uploadImage).not.toHaveBeenCalled();
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: {
          ...updateDto,
          smallerProfilePicKey: mockUser.smallerProfilePicKey,
          biggerProfilePicKey: mockUser.biggerProfilePicKey,
          biggerProfilePic: mockUser.biggerProfilePic,
          smallerProfilePic: mockUser.smallerProfilePic,
        },
        omit: {
          id: true,
          biggerProfilePicKey: true,
          smallerProfilePicKey: true,
          username: true,
        },
      });
      expect(UserRoles.removeUserRole).toHaveBeenCalled();
      expect(Session.getAllSessionHandlesForUser).toHaveBeenCalled();
    });

    it('should update user profile successfully with file on first time', async () => {
      const s3Result = {
        small: 'new-small-url',
        large: 'new-big-url',
        keys: ['new-small-key', 'new-big-key'],
      };
      mockS3Service.uploadImage.mockResolvedValue(s3Result);

      const result = await service.update('test@example.com', file, updateDto, true);

      expect(mockS3Service.deleteImages).toHaveBeenCalledWith('profile', ['small-key', 'big-key']);
      expect(mockS3Service.uploadImage).toHaveBeenCalledWith(file, 'profile', 'test');
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: {
          ...updateDto,
          smallerProfilePicKey: 'new-small-key',
          biggerProfilePicKey: 'new-big-key',
          biggerProfilePic: 'new-big-url',
          smallerProfilePic: 'new-small-url',
        },
        omit: expect.any(Object),
      });
    });

    it('should update user profile successfully without file not first time', async () => {
      const result = await service.update('test@example.com', null, updateDto, false);

      expect(UserRoles.removeUserRole).not.toHaveBeenCalled();
      expect(Session.getAllSessionHandlesForUser).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaClient.user.findUniqueOrThrow = vi.fn().mockRejectedValue({ code: 'P2025' });

      await expect(service.update('nonexistent@example.com', null, updateDto, false)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when nickname is missing on first time', async () => {
      const dtoWithoutNickname = {};

      await expect(service.update('test@example.com', null, dtoWithoutNickname, true)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException when S3 delete fails', async () => {
      mockS3Service.deleteImages.mockRejectedValue(new Error('S3 delete error'));

      await expect(service.update('test@example.com', file, updateDto, false)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when S3 upload fails', async () => {
      mockS3Service.uploadImage.mockRejectedValue(new Error('S3 upload error'));

      await expect(service.update('test@example.com', file, updateDto, false)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when DB update fails and rollback S3', async () => {
      const s3Result = {
        small: 'new-small-url',
        large: 'new-big-url',
        keys: ['new-small-key', 'new-big-key'],
      };
      mockS3Service.uploadImage.mockResolvedValue(s3Result);
      mockPrismaClient.user.update = vi.fn().mockRejectedValue(new Error('DB error'));

      await expect(service.update('test@example.com', file, updateDto, false)).rejects.toThrow(InternalServerErrorException);
      expect(mockS3Service.deleteImages).toHaveBeenCalledTimes(2);
      expect(mockS3Service.deleteImages).toHaveBeenNthCalledWith(2, 'profile', ['new-small-key', 'new-big-key']);
    });

    it('should handle SuperTokens errors gracefully on first time update', async () => {
      (UserRoles.removeUserRole as any).mockResolvedValue({ status: 'UNKNOWN_ROLE_ERROR' });
      (UserRoles.getRolesForUser as any).mockResolvedValue({ roles: [] });
      (Session.getAllSessionHandlesForUser as any).mockResolvedValue([]);

      await expect(service.update('test@example.com', null, updateDto, true)).resolves.toBeDefined();
      // Should not throw, just log error
    });
  });
});
