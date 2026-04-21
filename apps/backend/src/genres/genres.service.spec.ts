import { GenresService } from './genres.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrismaClient = {
  genres: {
    findMany: vi.fn(),
    createMany: vi.fn(),
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    delete: vi.fn(),
  },
} as unknown as PrismaService;

describe('GenresService', () => {
  let service: GenresService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GenresService(mockPrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeName', () => {
    it('should normalize genre name correctly', () => {
      const result = (service as any).normalizeName('  sci-fi  ');
      expect(result).toBe('Sci-fi');
    });

    it('should handle multiple words', () => {
      const result = (service as any).normalizeName('science fiction');
      expect(result).toBe('Science Fiction');
    });

    it('should handle empty string', () => {
      const result = (service as any).normalizeName('');
      expect(result).toBe('');
    });
  });

  describe('getOrCreateMany', () => {
    it('should return empty array for empty input', async () => {
      const result = await service.getOrCreateMany([]);
      expect(result).toEqual([]);
    });

    it('should return existing genres', async () => {
      const mockGenres = [{ id: '1', name: 'Fiction' }];
      mockPrismaClient.genres.findMany.mockResolvedValue(mockGenres);

      const result = await service.getOrCreateMany(['Fiction']);
      expect(result).toEqual(mockGenres);
    });

    it('should create new genres and return all', async () => {
      mockPrismaClient.genres.findMany.mockResolvedValueOnce([]);
      mockPrismaClient.genres.createMany.mockResolvedValue({ count: 1 });
      mockPrismaClient.genres.findMany.mockResolvedValue([{ id: '1', name: 'Fiction' }]);

      const result = await service.getOrCreateMany(['Fiction']);
      expect(mockPrismaClient.genres.createMany).toHaveBeenCalledWith({
        data: [{ name: 'Fiction' }],
        skipDuplicates: true,
      });
      expect(result).toEqual([{ id: '1', name: 'Fiction' }]);
    });

    it('should handle duplicates in input', async () => {
      mockPrismaClient.genres.findMany.mockResolvedValueOnce([]);
      mockPrismaClient.genres.createMany.mockResolvedValue({ count: 1 });
      mockPrismaClient.genres.findMany.mockResolvedValue([{ id: '1', name: 'Fiction' }]);

      const result = await service.getOrCreateMany(['Fiction', 'fiction']);
      expect(mockPrismaClient.genres.createMany).toHaveBeenCalledWith({
        data: [{ name: 'Fiction' }],
        skipDuplicates: true,
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockPrismaClient.genres.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.getOrCreateMany(['Fiction'])).rejects.toThrow('Failed to process the provided genres.');
    });
  });

  describe('searchGenres', () => {
    it('should return empty array for short query', async () => {
      const result = await service.searchGenres('a');
      expect(result).toEqual([]);
    });

    it('should return genres matching query', async () => {
      const mockGenres = [{ name: 'Fiction' }];
      mockPrismaClient.genres.findMany.mockResolvedValue(mockGenres);

      const result = await service.searchGenres('fic');
      expect(result).toEqual(mockGenres);
      expect(mockPrismaClient.genres.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'fic',
            mode: 'insensitive',
          },
        },
        take: 10,
        select: { name: true },
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockPrismaClient.genres.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.searchGenres('fiction')).rejects.toThrow('Failed to search for genres.');
    });
  });

  describe('create', () => {
    it('should create genre successfully', async () => {
      const mockGenre = { id: '1', name: 'Fiction' };
      mockPrismaClient.genres.create.mockResolvedValue(mockGenre);

      const result = await service.create({ name: 'fiction' });
      expect(result).toEqual(mockGenre);
      expect(mockPrismaClient.genres.create).toHaveBeenCalledWith({
        data: { name: 'Fiction' },
      });
    });

    it('should throw ConflictException for duplicate name', async () => {
      const error = { code: 'P2002' };
      mockPrismaClient.genres.create.mockRejectedValue(error);

      await expect(service.create({ name: 'Fiction' })).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on other error', async () => {
      mockPrismaClient.genres.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create({ name: 'Fiction' })).rejects.toThrow('Failed to create genre: Error: DB error');
    });
  });

  describe('findAll', () => {
    it('should return paginated genres', async () => {
      const mockGenres = [{ id: '1', name: 'Fiction' }];
      mockPrismaClient.genres.findMany.mockResolvedValue(mockGenres);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual(mockGenres);
      expect(mockPrismaClient.genres.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { name: 'asc' },
      });
    });

    it('should handle search query', async () => {
      mockPrismaClient.genres.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'fic' });
      expect(mockPrismaClient.genres.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { name: { contains: 'fic', mode: 'insensitive' } },
        orderBy: { name: 'asc' },
      });
    });

    it('should handle sort by name', async () => {
      mockPrismaClient.genres.findMany.mockResolvedValue([]);

      await service.findAll({ sortBy: 'name', sortOrder: 'desc' });
      expect(mockPrismaClient.genres.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { name: 'desc' },
      });
    });

    it('should handle sort by booksnumber', async () => {
      const mockResult = [{ id: '1', name: 'Fiction', _count: { books: 5 } }];
      (service as any).getGenresWithBookCounts = vi.fn().mockResolvedValue(mockResult);

      const result = await service.findAll({ sortBy: 'booksnumber' });
      expect((service as any).getGenresWithBookCounts).toHaveBeenCalledWith({}, 0, 10, 'asc');
      expect(result).toEqual(mockResult);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockPrismaClient.genres.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.findAll({})).rejects.toThrow('Failed to fetch genres.');
    });
  });

  describe('findOne', () => {
    it('should return genre by id', async () => {
      const mockGenre = { id: '1', name: 'Fiction' };
      mockPrismaClient.genres.findUniqueOrThrow.mockResolvedValue(mockGenre);

      const result = await service.findOne('1');
      expect(result).toEqual(mockGenre);
    });

    it('should throw NotFoundException when genre not found', async () => {
      mockPrismaClient.genres.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.findOne('1')).rejects.toThrow('Genre not found with the ID 1');
    });
  });

  describe('getTopGenresWithPopularBooks', () => {
    it('should return top genres with popular books', async () => {
      const mockResult = [{ id: '1', name: 'Fiction', _count: { books: 10 }, books: [] }];
      mockPrismaClient.genres.findMany.mockResolvedValue(mockResult);

      const result = await service.getTopGenresWithPopularBooks();
      expect(result).toEqual(mockResult);
      expect(mockPrismaClient.genres.findMany).toHaveBeenCalledWith({
        where: {
          books: {
            some: {
              book: {
                approveStatus: true,
              },
            },
          },
        },
        take: 30,
        orderBy: {
          books: {
            _count: 'desc',
          },
        },
        select: expect.any(Object),
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockPrismaClient.genres.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.getTopGenresWithPopularBooks()).rejects.toThrow('Failed to fetch top genres.');
    });
  });

  describe('remove', () => {
    it('should delete genre successfully', async () => {
      const mockGenre = { id: '1', name: 'Fiction' };
      mockPrismaClient.genres.findUniqueOrThrow.mockResolvedValue(mockGenre);
      mockPrismaClient.genres.delete.mockResolvedValue(mockGenre);

      const result = await service.remove('1');
      expect(result).toEqual(mockGenre);
    });

    it('should throw NotFoundException when genre not found', async () => {
      mockPrismaClient.genres.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.remove('1')).rejects.toThrow('Genre not found with the ID 1');
    });

    it('should throw ConflictException when genre has linked books', async () => {
      mockPrismaClient.genres.findUniqueOrThrow.mockResolvedValue({ id: '1', name: 'Fiction' });
      const error = { code: 'P2003' };
      mockPrismaClient.genres.delete.mockRejectedValue(error);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on other error', async () => {
      mockPrismaClient.genres.findUniqueOrThrow.mockResolvedValue({ id: '1', name: 'Fiction' });
      mockPrismaClient.genres.delete.mockRejectedValue(new Error('DB error'));

      await expect(service.remove('1')).rejects.toThrow('Failed to delete genre');
    });
  });
});
