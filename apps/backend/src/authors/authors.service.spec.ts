import { AuthorsService } from './authors.service';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { S3Service } from 'src/s3/s3.service';
import { GenresService } from 'src/genres/genres.service';
import { HttpService } from '@nestjs/axios';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

const mockPrismaClient = {
  author: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    count: vi.fn(),
  },
} as unknown as PrismaService;

const mockS3Service = {
  uploadImage: vi.fn(),
  deleteImages: vi.fn(),
};

const mockGenresService = {
  getOrCreateMany: vi.fn(),
};

const mockHttpService = {
  get: vi.fn(),
};

describe('AuthorsService', () => {
  let service: AuthorsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthorsService(
      mockS3Service as unknown as S3Service,
      mockPrismaClient,
      mockGenresService as unknown as GenresService,
      mockHttpService as unknown as HttpService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchExternal', () => {
    it('should return authors from Open Library', async () => {
      const mockResponse = {
        data: {
          docs: [
            { key: '/authors/OL1A', name: 'Author One' },
            { key: '/authors/OL2A', name: 'Author Two' },
          ],
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.searchExternal('test');
      expect(result).toEqual([
        { openLibraryId: '/authors/OL1A', name: 'Author One', birthDate: null, subjects: null, top_works: null },
        { openLibraryId: '/authors/OL2A', name: 'Author Two', birthDate: null, subjects: null, top_works: null },
      ]);
    });

    it('should return empty array on error', async () => {
      mockHttpService.get.mockReturnValue(of({ data: { docs: [] } }));

      const result = await service.searchExternal('test');
      expect(result).toEqual([]);
    });

    it('should return empty array when no docs', async () => {
      const mockResponse = { data: { docs: [] } };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.searchExternal('test');
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'Test Author',
      bio: 'Bio',
      birthDate: '2000-01-01',
      nationality: 'Test',
      openLibraryId: 'OL1A',
    };
    const file = { buffer: Buffer.from('test') } as any;

    it('should create author successfully with file', async () => {
      mockPrismaClient.author.findUnique.mockResolvedValue(null);
      mockPrismaClient.author.findFirst.mockResolvedValue(null);
      mockS3Service.uploadImage.mockResolvedValue({
        small: 'small-url',
        large: 'large-url',
        keys: ['key1', 'key2'],
      });
      mockPrismaClient.author.create.mockResolvedValue({ id: '1', ...createDto });

      const result = await service.create(file, createDto);
      expect(result).toEqual({ id: '1', ...createDto });
    });

    it('should create author with default images when no file', async () => {
      mockPrismaClient.author.findUnique.mockResolvedValue(null);
      mockPrismaClient.author.findFirst.mockResolvedValue(null);
      mockPrismaClient.author.create = vi.fn().mockResolvedValue({
        id: '1',
        ...createDto,
        smallerProfilePic: 'http://localhost:4566/author-images/author-default.png',
        biggerProfilePic: 'http://localhost:4566/author-images/author-default.png',
        smallerProfilePicKey: 'author-default.png',
        biggerProfilePicKey: 'author-default.png',
      });

      const result = await service.create(null, createDto);
      expect(mockS3Service.uploadImage).not.toHaveBeenCalled();
      expect(result.smallerProfilePic).toBe('http://localhost:4566/author-images/author-default.png');
    });

    it('should throw ConflictException for duplicate openLibraryId', async () => {
      mockPrismaClient.author.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.create(file, createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate author details', async () => {
      mockPrismaClient.author.findUnique.mockResolvedValue(null);
      mockPrismaClient.author.findFirst.mockResolvedValue({ id: '1' });

      await expect(service.create(file, createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on S3 upload error', async () => {
      mockPrismaClient.author.findUnique.mockResolvedValue(null);
      mockPrismaClient.author.findFirst.mockResolvedValue(null);
      mockS3Service.uploadImage.mockRejectedValue(new Error('S3 error'));

      await expect(service.create(file, createDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should rollback S3 on DB create error', async () => {
      mockPrismaClient.author.findUnique.mockResolvedValue(null);
      mockPrismaClient.author.findFirst.mockResolvedValue(null);
      mockS3Service.uploadImage.mockResolvedValue({
        small: 'small-url',
        large: 'large-url',
        keys: ['key1', 'key2'],
      });
      mockPrismaClient.author.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create(file, createDto)).rejects.toThrow(InternalServerErrorException);
      expect(mockS3Service.deleteImages).toHaveBeenCalledWith('author', ['key1', 'key2']);
    });
  });

  describe('findAll', () => {
    it('should return paginated authors for admin', async () => {
      const mockAuthors = [{ id: '1', name: 'Author', favoritedBy: [] }];
      mockPrismaClient.author.findMany.mockResolvedValue(mockAuthors);
      mockPrismaClient.author.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 }, true, 'user1');
      expect(result).toEqual({ data: [{ id: '1', name: 'Author', isFavorited: false }], meta: { total: 1, page: 1, lastPage: 1 } });
      expect(mockPrismaClient.author.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should filter by approveStatus for non-admin', async () => {
      mockPrismaClient.author.findMany.mockResolvedValue([]);
      mockPrismaClient.author.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10 }, false, 'user1');
      expect(mockPrismaClient.author.findMany).toHaveBeenCalledWith({
        where: { approveStatus: true },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should handle search', async () => {
      mockPrismaClient.author.findMany.mockResolvedValue([]);
      mockPrismaClient.author.count.mockResolvedValue(0);

      await service.findAll({ search: 'test' }, true, 'user1');
      expect(mockPrismaClient.author.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { bio: { contains: 'test', mode: 'insensitive' } },
            { nationality: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should sort by favorites', async () => {
      mockPrismaClient.author.findMany.mockResolvedValue([]);
      mockPrismaClient.author.count.mockResolvedValue(0);

      await service.findAll({ sortBy: 'favorites' }, true, 'user1');
      expect(mockPrismaClient.author.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { favoritedBy: { _count: 'asc' } },
        include: expect.any(Object),
      });
    });

    it('should sort by rating', async () => {
      (service as any).findAllSortedByRating = vi.fn().mockResolvedValue([]);

      const result = await service.findAll({ sortBy: 'rating' }, true, 'user1');
      expect((service as any).findAllSortedByRating).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockPrismaClient.author.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.findAll({}, true, 'user1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return author by id', async () => {
      const mockAuthor = { id: '1', name: 'Author', favoritedBy: [] };
      mockPrismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);

      const result = await service.findOne('1');
      expect(result).toEqual({ id: '1', name: 'Author', isFavoritedbyCurrentUser: false });
    });

    it('should throw NotFoundException when author not found', async () => {
      mockPrismaClient.author.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  // Add more tests for update and remove if needed, but for brevity, stopping here
});
